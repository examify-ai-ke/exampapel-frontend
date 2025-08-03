'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DashboardBreadcrumb } from '@/components/ui/breadcrumb';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Edit,
    Save,
    X,
    Camera,
    Shield,
    Bell,
    Globe
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: user?.first_name || '',
        lastName: user?.last_name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        bio: user?.bio || '',
        location: user?.location || '',
        institution: user?.institution || '',
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = () => {
        // Implement save logic here
        console.log('Saving profile:', formData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData({
            firstName: user?.first_name || '',
            lastName: user?.last_name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            bio: user?.bio || '',
            location: user?.location || '',
            institution: user?.institution || '',
        });
        setIsEditing(false);
    };

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <DashboardBreadcrumb currentPage="Profile" />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
                    <p className="text-muted-foreground">
                        Manage your account settings and preferences
                    </p>
                </div>
                <Button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center space-x-2"
                >
                    {isEditing ? (
                        <>
                            <X className="h-4 w-4" />
                            <span>Cancel</span>
                        </>
                    ) : (
                        <>
                            <Edit className="h-4 w-4" />
                            <span>Edit Profile</span>
                        </>
                    )}
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Profile Overview */}
                <div className="md:col-span-1">
                    <Card>
                        <CardHeader className="text-center">
                            <div className="relative inline-block">
                                <Avatar className="h-24 w-24 mx-auto">
                                    <AvatarImage src={user?.avatar_url} alt={user?.full_name || 'User'} />
                                    <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
                                        {user?.first_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                {isEditing && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="absolute bottom-0 right-0 h-8 w-8 rounded-full p-0"
                                    >
                                        <Camera className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            <CardTitle className="mt-4">
                                {user?.first_name} {user?.last_name || 'User'}
                            </CardTitle>
                            <div className="flex items-center justify-center space-x-2">
                                <Badge variant="secondary" className="capitalize">
                                    {user?.role || 'Student'}
                                </Badge>
                                <Badge variant="outline">
                                    Member since {new Date(user?.created_at || Date.now()).getFullYear()}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-3 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{user?.email}</span>
                            </div>
                            {user?.phone && (
                                <div className="flex items-center space-x-3 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{user.phone}</span>
                                </div>
                            )}
                            {user?.location && (
                                <div className="flex items-center space-x-3 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span>{user.location}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Papers Completed</span>
                                <span className="font-semibold">18</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Study Hours</span>
                                <span className="font-semibold">45h</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Accuracy Rate</span>
                                <span className="font-semibold">87.5%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Current Streak</span>
                                <span className="font-semibold">7 days</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Profile Details */}
                <div className="md:col-span-2 space-y-6">
                    {/* Personal Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input
                                        id="firstName"
                                        value={formData.firstName}
                                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        value={formData.lastName}
                                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="location">Location</Label>
                                <Input
                                    id="location"
                                    value={formData.location}
                                    onChange={(e) => handleInputChange('location', e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="institution">Institution</Label>
                                <Input
                                    id="institution"
                                    value={formData.institution}
                                    onChange={(e) => handleInputChange('institution', e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea
                                    id="bio"
                                    value={formData.bio}
                                    onChange={(e) => handleInputChange('bio', e.target.value)}
                                    disabled={!isEditing}
                                    placeholder="Tell us about yourself..."
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Account Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Shield className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Change Password</p>
                                        <p className="text-sm text-muted-foreground">Update your password</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm">
                                    Change
                                </Button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Bell className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Notification Settings</p>
                                        <p className="text-sm text-muted-foreground">Manage your notifications</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm">
                                    Configure
                                </Button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Globe className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Privacy Settings</p>
                                        <p className="text-sm text-muted-foreground">Control your privacy</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm">
                                    Manage
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Save/Cancel Buttons */}
                    {isEditing && (
                        <div className="flex items-center justify-end space-x-3">
                            <Button variant="outline" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button onClick={handleSave} className="flex items-center space-x-2">
                                <Save className="h-4 w-4" />
                                <span>Save Changes</span>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 