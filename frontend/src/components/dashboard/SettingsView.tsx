import { motion } from 'framer-motion';
import { Settings, Bell, Shield, Palette, Users, Zap, Globe, Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const settingsSections = [
  {
    icon: Bell,
    title: 'Notifications',
    description: 'Configure how you receive alerts and updates',
    settings: [
      { id: 'email-notif', label: 'Email notifications', description: 'Get notified via email', enabled: true },
      { id: 'sla-alerts', label: 'SLA breach alerts', description: 'Instant alerts for SLA breaches', enabled: true },
      { id: 'daily-digest', label: 'Daily digest', description: 'Summary of daily activity', enabled: false },
    ],
  },
  {
    icon: Zap,
    title: 'AI Settings',
    description: 'Configure AI classification and response generation',
    settings: [
      { id: 'auto-classify', label: 'Auto-classification', description: 'Automatically classify incoming tickets', enabled: true },
      { id: 'auto-response', label: 'Auto-response drafts', description: 'Generate response suggestions', enabled: true },
      { id: 'dedup', label: 'Ticket deduplication', description: 'Automatically merge duplicate tickets', enabled: true },
    ],
  },
  {
    icon: Shield,
    title: 'Security',
    description: 'Manage security and access controls',
    settings: [
      { id: '2fa', label: 'Two-factor authentication', description: 'Add extra security to your account', enabled: false },
      { id: 'session-timeout', label: 'Auto session timeout', description: 'Automatically log out after inactivity', enabled: true },
    ],
  },
];

export const SettingsView = () => {
  return (
    <div className="flex-1 flex flex-col overflow-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your preferences and system configuration</p>
      </motion.div>

      <div className="space-y-6 max-w-3xl">
        {settingsSections.map((section, sectionIndex) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
            >
              <Card className="bg-card/50 backdrop-blur-sm border-border">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{section.title}</CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {section.settings.map((setting, index) => (
                    <div key={setting.id}>
                      {index > 0 && <Separator className="mb-4" />}
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor={setting.id} className="text-sm font-medium">
                            {setting.label}
                          </Label>
                          <p className="text-xs text-muted-foreground">{setting.description}</p>
                        </div>
                        <Switch id={setting.id} defaultChecked={setting.enabled} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {/* Integration Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-chart-2/10">
                  <Globe className="h-5 w-5 text-chart-2" />
                </div>
                <div>
                  <CardTitle className="text-base">Integrations</CardTitle>
                  <CardDescription>Connect external services and APIs</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="justify-start h-auto py-3">
                  <Database className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <p className="font-medium">Database</p>
                    <p className="text-xs text-muted-foreground">Connect your database</p>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto py-3">
                  <Users className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <p className="font-medium">CRM</p>
                    <p className="text-xs text-muted-foreground">Sync with your CRM</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
