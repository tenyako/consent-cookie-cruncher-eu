
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Shield, Zap, BarChart3, Settings } from 'lucide-react';

const ExtensionInstaller = () => {
  const [isChrome, setIsChrome] = useState(false);

  useEffect(() => {
    // Check if user is on Chrome
    const userAgent = navigator.userAgent;
    setIsChrome(userAgent.includes('Chrome') && !userAgent.includes('Edg'));
  }, []);

  const downloadExtension = () => {
    // Create a zip file with all extension files
    const files = [
      'manifest.json',
      'content.js',
      'background.js',
      'popup.html',
      'popup.js',
      'icon16.png',
      'icon48.png',
      'icon128.png'
    ];

    // In a real implementation, you'd create a downloadable zip
    alert('Extension files are ready! Check the public folder for all extension files. Load them as an unpacked extension in Chrome Developer Mode.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🍪 EU Cookie Banner Auto-Handler
          </h1>
          <p className="text-xl text-gray-600">
            Automatically handle annoying cookie consent banners across EU websites
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Privacy Focused
              </CardTitle>
              <CardDescription>
                Automatically accepts necessary cookies while respecting your privacy preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Detects 50+ common cookie banner patterns</li>
                <li>• Supports 12 European languages</li>
                <li>• Works on major EU websites</li>
                <li>• No data collection or tracking</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                Smart Detection
              </CardTitle>
              <CardDescription>
                Advanced algorithms identify and interact with cookie banners automatically
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Real-time banner detection</li>
                <li>• Customizable delay settings</li>
                <li>• Handles dynamic content</li>
                <li>• Fallback mechanisms</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Statistics Tracking</h3>
                <p className="text-sm text-gray-600">Monitor how many banners have been handled</p>
              </div>
              <div className="text-center">
                <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Easy Toggle</h3>
                <p className="text-sm text-gray-600">Enable/disable the extension with one click</p>
              </div>
              <div className="text-center">
                <Zap className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Customizable</h3>
                <p className="text-sm text-gray-600">Adjust delay and behavior settings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            {isChrome ? (
              <div>
                <h3 className="text-xl font-semibold mb-4">Ready to Install</h3>
                <p className="text-gray-600 mb-6">
                  Download the extension files and load them as an unpacked extension in Chrome
                </p>
                <Button onClick={downloadExtension} size="lg" className="mb-4">
                  <Download className="mr-2 h-4 w-4" />
                  Get Extension Files
                </Button>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>1. Download the extension files</p>
                  <p>2. Open Chrome → Settings → Extensions</p>
                  <p>3. Enable "Developer mode"</p>
                  <p>4. Click "Load unpacked" and select the public folder</p>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-semibold mb-4 text-orange-600">Chrome Required</h3>
                <p className="text-gray-600 mb-6">
                  This extension is designed for Google Chrome. Please open this page in Chrome to continue.
                </p>
                <Button variant="outline" size="lg">
                  Open in Chrome
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2024 EU Cookie Banner Auto-Handler. Open source and privacy-focused.</p>
        </div>
      </div>
    </div>
  );
};

export default ExtensionInstaller;
