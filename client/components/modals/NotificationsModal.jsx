"use client";

import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTabs,
  DialogTab
} from "@/components/ui/dialog";
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, X, Bell, MessageSquare, AtSign, Code, 
  Check, Globe, Trash2, RefreshCw, Settings, 
  AlertCircle, Info, Terminal
} from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

function NotificationsModal({ open, setOpen, darkMode }) {
  const { 
    notifications, 
    preferences, 
    isLoading, 
    updatePreferences, 
    markAllAsRead,
    markAsRead,
    deleteNotification,
    unreadCount 
  } = useNotifications();
  
  const [activeTab, setActiveTab] = useState("all");
  const [localPreferences, setLocalPreferences] = useState({
    // Push Notifications
    apiUpdatesEnabled: true,
    requestErrorsEnabled: true,
    testFailuresEnabled: true,
    mentionsEnabled: true,
    // Email Notifications
    emailCommentsEnabled: false,
    emailSharedApisEnabled: true,
    emailSecurityAlertsEnabled: true,
    newsletterEnabled: false,
    // Integration Notifications
    slackEnabled: false,
    discordEnabled: false,
    // Integration configs
    slackWebhookUrl: '',
    slackChannel: '',
    discordWebhookUrl: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  // Update local state when preferences are loaded
  useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences);
    }
  }, [preferences]);

  const handleToggleChange = (key) => {
    setLocalPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleInputChange = (key, value) => {
    setLocalPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const success = await updatePreferences(localPreferences);
      if (success) {
        toast.success("Preferences saved", {
          description: "Your notification preferences have been updated."
        });
      } else {
        toast.error("Error saving preferences", {
          description: "Failed to save preferences. Please try again."
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "An unexpected error occurred."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark notifications as read");
    }
  };

  const handleResetToDefault = () => {
    setLocalPreferences({
      // Push Notifications
      apiUpdatesEnabled: true,
      requestErrorsEnabled: true,
      testFailuresEnabled: true,
      mentionsEnabled: true,
      // Email Notifications
      emailCommentsEnabled: false,
      emailSharedApisEnabled: true,
      emailSecurityAlertsEnabled: true,
      newsletterEnabled: false,
      // Integration Notifications
      slackEnabled: false,
      discordEnabled: false,
      // Integration configs
      slackWebhookUrl: '',
      slackChannel: '',
      discordWebhookUrl: ''
    });
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await deleteNotification(id);
      toast.success("Notification removed");
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to remove notification");
    }
  };

  // Helper to get icon for notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'api_update': return <Info className="h-4 w-4" />;
      case 'request_error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'test_failure': return <Terminal className="h-4 w-4 text-orange-500" />;
      case 'mention': return <AtSign className="h-4 w-4 text-blue-500" />;
      case 'comment': return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'shared_api': return <Code className="h-4 w-4 text-purple-500" />;
      case 'security': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent 
        className={`max-w-xl max-h-[90vh] overflow-hidden flex flex-col ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
        }`}
      >
        <Tabs defaultValue="notifications" className="w-full">
          <DialogHeader className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <DialogTitle>
                <VisuallyHidden>Bildirimler</VisuallyHidden>
              </DialogTitle>
              
              <TabsList>
                <TabsTrigger value="notifications" className="flex items-center">
                  <Bell className="h-4 w-4 mr-2" /> 
                  Notifications
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="preferences" className="flex items-center">
                  <Settings className="h-4 w-4 mr-2" /> Preferences
                </TabsTrigger>
              </TabsList>
              <div className="flex items-center ml-4">
                <DialogClose className="text-gray-500 hover:text-gray-700">
                  <X className="h-4 w-4" />
                </DialogClose>
              </div>
            </div>
          </DialogHeader>

          <TabsContent value="notifications" className="flex-1 overflow-y-auto p-0">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex space-x-2">
                <Button 
                  variant={activeTab === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("all")}
                >
                  All
                </Button>
                <Button 
                  variant={activeTab === "unread" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("unread")}
                >
                  Unread
                </Button>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleMarkAllAsRead}
                className="text-xs flex items-center"
              >
                <Check className="h-4 w-4 mr-1" /> Mark all as read
              </Button>
            </div>

            {isLoading ? (
              <div className="flex-1 flex items-center justify-center p-6">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              </div>
            ) : notifications && notifications.length > 0 ? (
              <div className="divide-y">
                {notifications
                  .filter(n => activeTab === "all" || (activeTab === "unread" && !n.isRead))
                  .map(notification => (
                    <div key={notification.id} 
                      className={`p-4 flex ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                    >
                      <div className="mr-3 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          <span className="text-xs text-gray-500">
                            {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex gap-2 mt-2">
                          {!notification.isRead && (
                            <Button 
                              variant="ghost" 
                              size="xs"
                              className="h-6 text-xs"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              Mark as read
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleDeleteNotification(notification.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <Bell className="h-12 w-12 text-gray-300 mb-3" />
                <h3 className="text-lg font-medium">No notifications</h3>
                <p className="text-gray-500 mt-1">
                  {activeTab === "all" 
                    ? "You don't have any notifications yet." 
                    : "You don't have any unread notifications."}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="preferences" className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-lg mb-2 flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Push Notifications
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Configure what notifications you receive in the app
                </p>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="api-updates" className="font-medium">API Updates</Label>
                      <p className="text-sm text-gray-500">
                        Receive notifications when an API endpoint changes
                      </p>
                    </div>
                    <Switch 
                      id="api-updates" 
                      checked={localPreferences.apiUpdatesEnabled}
                      onCheckedChange={() => handleToggleChange('apiUpdatesEnabled')}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="request-errors" className="font-medium">Request Errors</Label>
                      <p className="text-sm text-gray-500">
                        Receive notifications for API request errors
                      </p>
                    </div>
                    <Switch 
                      id="request-errors" 
                      checked={localPreferences.requestErrorsEnabled}
                      onCheckedChange={() => handleToggleChange('requestErrorsEnabled')}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="test-failures" className="font-medium">Test Failures</Label>
                      <p className="text-sm text-gray-500">
                        Receive notifications when API tests fail
                      </p>
                    </div>
                    <Switch 
                      id="test-failures" 
                      checked={localPreferences.testFailuresEnabled}
                      onCheckedChange={() => handleToggleChange('testFailuresEnabled')}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="team-mentions" className="font-medium">
                        <span className="flex items-center">
                          <AtSign className="h-4 w-4 mr-1" /> Mentions
                        </span>
                      </Label>
                      <p className="text-sm text-gray-500">
                        Receive notifications when someone mentions you
                      </p>
                    </div>
                    <Switch 
                      id="team-mentions" 
                      checked={localPreferences.mentionsEnabled}
                      onCheckedChange={() => handleToggleChange('mentionsEnabled')}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-lg mb-2 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Email Notifications
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Configure what notifications you receive via email
                </p>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-comments" className="font-medium">Comments</Label>
                      <p className="text-sm text-gray-500">
                        Receive email notifications for new comments
                      </p>
                    </div>
                    <Switch 
                      id="email-comments" 
                      checked={localPreferences.emailCommentsEnabled}
                      onCheckedChange={() => handleToggleChange('emailCommentsEnabled')}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-shared" className="font-medium">Shared APIs</Label>
                      <p className="text-sm text-gray-500">
                        Receive email notifications when an API is shared with you
                      </p>
                    </div>
                    <Switch 
                      id="email-shared" 
                      checked={localPreferences.emailSharedApisEnabled}
                      onCheckedChange={() => handleToggleChange('emailSharedApisEnabled')}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-security" className="font-medium">Security Alerts</Label>
                      <p className="text-sm text-gray-500">
                        Receive email notifications for important security events
                      </p>
                    </div>
                    <Switch 
                      id="email-security" 
                      checked={localPreferences.emailSecurityAlertsEnabled}
                      onCheckedChange={() => handleToggleChange('emailSecurityAlertsEnabled')}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="newsletter" className="font-medium">Newsletter</Label>
                      <p className="text-sm text-gray-500">
                        Receive our weekly newsletter with API tips and updates
                      </p>
                    </div>
                    <Switch 
                      id="newsletter" 
                      checked={localPreferences.newsletterEnabled}
                      onCheckedChange={() => handleToggleChange('newsletterEnabled')}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-lg mb-2 flex items-center">
                  <Code className="h-5 w-5 mr-2" />
                  Integration Notifications
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Configure notifications for integrated services
                </p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="slack-notify" className="font-medium">Slack</Label>
                        <p className="text-sm text-gray-500">
                          Send notifications to your Slack workspace
                        </p>
                      </div>
                      <Switch 
                        id="slack-notify" 
                        checked={localPreferences.slackEnabled}
                        onCheckedChange={() => handleToggleChange('slackEnabled')}
                      />
                    </div>
                    
                    {localPreferences.slackEnabled && (
                      <div className="pt-2 space-y-2">
                        <div>
                          <Label htmlFor="slack-webhook" className="text-sm">Webhook URL</Label>
                          <Input 
                            id="slack-webhook"
                            value={localPreferences.slackWebhookUrl || ''}
                            onChange={(e) => handleInputChange('slackWebhookUrl', e.target.value)}
                            placeholder="https://hooks.slack.com/services/..."
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="slack-channel" className="text-sm">Channel</Label>
                          <Input 
                            id="slack-channel"
                            value={localPreferences.slackChannel || ''}
                            onChange={(e) => handleInputChange('slackChannel', e.target.value)}
                            placeholder="#notifications"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="discord-notify" className="font-medium">Discord</Label>
                        <p className="text-sm text-gray-500">
                          Send notifications to your Discord server
                        </p>
                      </div>
                      <Switch 
                        id="discord-notify" 
                        checked={localPreferences.discordEnabled}
                        onCheckedChange={() => handleToggleChange('discordEnabled')}
                      />
                    </div>
                    
                    {localPreferences.discordEnabled && (
                      <div className="pt-2">
                        <Label htmlFor="discord-webhook" className="text-sm">Webhook URL</Label>
                        <Input 
                          id="discord-webhook"
                          value={localPreferences.discordWebhookUrl || ''}
                          onChange={(e) => handleInputChange('discordWebhookUrl', e.target.value)}
                          placeholder="https://discord.com/api/webhooks/..."
                          className="mt-1"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button 
                variant="outline" 
                onClick={handleResetToDefault}
                disabled={isSaving}
              >
                <RefreshCw className="h-4 w-4 mr-1" /> Reset to Default
              </Button>
              <Button 
                onClick={handleSaveChanges}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default NotificationsModal;
export { NotificationsModal };