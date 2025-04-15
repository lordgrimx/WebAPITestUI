"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { X, Bell, MessageSquare, AtSign, Code, Globe } from "lucide-react";

function NotificationsModal({ open, setOpen, darkMode }) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent 
        className={`max-w-xl max-h-[90vh] overflow-hidden flex flex-col ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
        }`}
      >
        <DialogHeader className="px-6 py-4 border-b border-gray-200">
          <DialogTitle className="text-xl font-semibold flex items-center">
            <Bell className="h-5 w-5 mr-2" /> Notifications
          </DialogTitle>
          <DialogClose className="absolute right-4 top-4 text-gray-500 hover:text-gray-700">
            <X className="h-4 w-4" />
          </DialogClose>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
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
                  <Switch id="api-updates" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="request-errors" className="font-medium">Request Errors</Label>
                    <p className="text-sm text-gray-500">
                      Receive notifications for API request errors
                    </p>
                  </div>
                  <Switch id="request-errors" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="test-failures" className="font-medium">Test Failures</Label>
                    <p className="text-sm text-gray-500">
                      Receive notifications when API tests fail
                    </p>
                  </div>
                  <Switch id="test-failures" defaultChecked />
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
                  <Switch id="team-mentions" defaultChecked />
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
                  <Switch id="email-comments" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-shared" className="font-medium">Shared APIs</Label>
                    <p className="text-sm text-gray-500">
                      Receive email notifications when an API is shared with you
                    </p>
                  </div>
                  <Switch id="email-shared" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-security" className="font-medium">Security Alerts</Label>
                    <p className="text-sm text-gray-500">
                      Receive email notifications for important security events
                    </p>
                  </div>
                  <Switch id="email-security" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="newsletter" className="font-medium">Newsletter</Label>
                    <p className="text-sm text-gray-500">
                      Receive our weekly newsletter with API tips and updates
                    </p>
                  </div>
                  <Switch id="newsletter" />
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
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="slack-notify" className="font-medium">Slack</Label>
                    <p className="text-sm text-gray-500">
                      Send notifications to your Slack workspace
                    </p>
                  </div>
                  <Switch id="slack-notify" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="discord-notify" className="font-medium">Discord</Label>
                    <p className="text-sm text-gray-500">
                      Send notifications to your Discord server
                    </p>
                  </div>
                  <Switch id="discord-notify" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-gray-200">
          <Button variant="outline">Reset to Default</Button>
          <Button>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default NotificationsModal;
export { NotificationsModal };