'use client';

import React, { useEffect, useRef, useState } from 'react';
import EditorJS, { OutputData } from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';
import Quote from '@editorjs/quote';
import Code from '@editorjs/code';
import Embed from '@editorjs/embed';
import Delimiter from '@editorjs/delimiter';
import Table from '@editorjs/table';
import ImageTool from '@editorjs/image';

interface EditorProps {
  data: OutputData;
  onChange: (data: OutputData) => void;
  holder: string;
}

const Editor: React.FC<EditorProps> = ({ data, onChange, holder }) => {
  const ref = useRef<EditorJS | null>(null);
  const [isReady, setIsReady] = useState(false);
  const isInitializing = useRef(false);

  useEffect(() => {
    // Prevent multiple initializations
    if (isInitializing.current) {
      return;
    }

    const initEditor = async () => {
      // Check if holder element exists
      const holderElement = document.getElementById(holder);
      if (!holderElement) {
        console.warn(`Editor holder element #${holder} not found`);
        return;
      }

      // Clean up any existing editor instance
      if (ref.current) {
        try {
          await ref.current.isReady;
          ref.current.destroy();
          ref.current = null;
        } catch (error) {
          console.warn('Error destroying previous editor:', error);
        }
      }

      isInitializing.current = true;

      try {
        const editor = new EditorJS({
          holder: holder,
          placeholder: 'Click here to start writing your question...',
          tools: {
            header: {
              class: Header as any,
              config: {
                placeholder: 'Enter a heading',
                levels: [1, 2, 3, 4],
                defaultLevel: 1
              }
            },
            list: {
              class: List as any,
              inlineToolbar: true,
              config: {
                defaultStyle: 'unordered'
              }
            },
            paragraph: {
              class: Paragraph as any,
              inlineToolbar: true,
            },
            quote: {
              class: Quote as any,
              inlineToolbar: true,
              config: {
                quotePlaceholder: 'Enter a quote',
                captionPlaceholder: 'Quote\'s author',
              },
            },
            code: {
              class: Code as any,
              config: {
                placeholder: 'Enter code'
              }
            },
            embed: Embed as any,
            delimiter: Delimiter as any,
            table: {
              class: Table as any,
              inlineToolbar: true,
              config: {
                rows: 2,
                cols: 3,
              },
            },
            image: {
              class: ImageTool as any,
              config: {
                endpoints: {
                  byFile: 'http://localhost:3001/api/upload-image',
                  byUrl: 'http://localhost:3001/api/fetch-image',
                },
              },
            },
          },
          data,
          async onChange(api) {
            try {
              const data = await api.saver.save();
              onChange(data);
            } catch (error) {
              console.error('Error saving editor data:', error);
            }
          },
          minHeight: 50,
        });

        await editor.isReady;
        ref.current = editor;
        setIsReady(true);
      } catch (error) {
        console.error('Error initializing editor:', error);
      } finally {
        isInitializing.current = false;
      }
    };

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      initEditor();
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (ref.current) {
        ref.current.isReady
          .then(() => {
            if (ref.current && ref.current.destroy) {
              ref.current.destroy();
              ref.current = null;
            }
          })
          .catch((error) => {
            console.warn('Error during editor cleanup:', error);
          });
      }
      isInitializing.current = false;
    };
  }, [holder]);

  return (
    <div className="w-full">
      <div id={holder} className="prose prose-sm max-w-70 w-full" />
      {!isReady && (
        <div className="text-sm text-gray-500 mt-2">Loading editor...</div>
      )}
    </div>
  );
};

export default Editor;