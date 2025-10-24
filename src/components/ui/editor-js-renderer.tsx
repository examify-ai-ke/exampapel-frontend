import React from 'react';
import type { OutputBlockData, OutputData } from "@editorjs/editorjs";
import Image from 'next/image';
// Define types for the block data structure
interface BlockData {
  text?: string;
  level?: number;
  style?: 'ordered' | 'unordered';
  items?: string[];
  file?: { url: string };
  url?: string;
  caption?: string;
  code?: string;
  embed?: string;
  height?: number;
  content?: string[][];
  [key: string]: unknown;
}

const EditorJsRenderer = ({ data }: { data: OutputData }) => {
  // Function to render each block based on its type
  const renderBlock = (block: OutputBlockData<string, BlockData>, index: number) => {
    const { id, type, data: blockData } = block;

    switch (type) {
      case 'header':
        // Use React.createElement for dynamic heading levels
        return React.createElement(
          `h${blockData.level ?? 2}`,
          { key: id ?? index, id: id ?? `header-${index}` },
          blockData.text
        );

      case 'paragraph':
        return (
          <p 
            key={id ?? `p-${index}`} 
            id={id ?? `p-${index}`} 
            dangerouslySetInnerHTML={blockData.text ? { __html: blockData.text } : undefined}
          />
        );

      case 'list':
        // Choose appropriate list style based on list type
        const listStyle = blockData.style === 'ordered' ? 'list-decimal' : 'list-disc';
        const ListTag = blockData.style === 'ordered' ? 'ol' : 'ul';
        
        return (
          <ListTag 
            key={id ?? `list-${index}`} 
            id={id ?? `list-${index}`} 
            className={`${listStyle} list-outside ml-5 mb-4 space-y-1`}
          >
            {blockData.items?.map((item, idx) => {
              // Handle both string items (old format) and object items (new format)
              const content = typeof item === 'string' 
                ? item 
                : (item as { content: string }).content || '';
              
              return (
                <li 
                  key={`${id ?? 'list'}-item-${idx}`}
                  dangerouslySetInnerHTML={{ __html: content }} 
                />
              );
            })}
          </ListTag>
        );

        // Then replace the image case in the switch statement
        case 'image':
            return (
                <figure key={id ?? `img-${index}`} id={id ?? `img-${index}`} className="image-block">
                    <Image
                        src={blockData.file?.url ?? blockData.url ?? ''}
                        alt={blockData.caption ?? ''}
                        width={600}
                        height={400}
                        style={{ maxWidth: '100%', height: 'auto' }}
                        priority={index === 0}
                    />
                    {blockData.caption && <figcaption>{blockData.caption}</figcaption>}
                </figure>
            );

      case 'quote':
        return (
          <blockquote key={id ?? `quote-${index}`} id={id ?? `quote-${index}`}>
            {blockData.text && (
              <p dangerouslySetInnerHTML={{ __html: blockData.text }} />
            )}
            {blockData.caption && <cite>{blockData.caption}</cite>}
          </blockquote>
        );

      case 'code':
        return (
          <pre key={id ?? `code-${index}`} id={id ?? `code-${index}`}>
            <code>{blockData.code}</code>
          </pre>
        );

      case 'embed':
        return (
          <div key={id ?? `embed-${index}`} id={id ?? `embed-${index}`} className="embed-block">
            <iframe
              src={blockData.embed ?? ''}
              height={blockData.height ?? 320}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            {blockData.caption && <p>{blockData.caption}</p>}
          </div>
        );

      case 'delimiter':
        return <hr key={id ?? `delimiter-${index}`} id={id ?? `delimiter-${index}`} className="delimiter" />;

      case 'table':
        return (
          <table key={id ?? `table-${index}`} id={id ?? `table-${index}`}>
            <tbody>
              {blockData.content?.map((row, rowIndex) => (
                <tr key={`${id ?? 'table'}-row-${rowIndex}`}>
                  {row.map((cell, cellIndex) => (
                    <td 
                        key={`${id ?? 'table'}-cell-${rowIndex}-${cellIndex}`} 
                      dangerouslySetInnerHTML={{ __html: cell }} 
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        );

      default:
        console.warn(`Block type "${type}" not supported`);
        return null;
    }
  };

  return (
    <div className="editorjs-content">
      {data?.blocks?.map(renderBlock) || <p>No content to display</p>}
    </div>
  );
};

 
export default EditorJsRenderer;