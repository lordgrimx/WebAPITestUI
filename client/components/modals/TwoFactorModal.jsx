import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { toast } from 'sonner';

const TwoFactorModal = ({ onVerify, onCancel, email }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!code) {
      toast.error('Please enter the verification code');
      return;
    }    setLoading(true);
    try {
      await onVerify(code);
    } catch (error) {
      toast.error(error.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-[400px] max-w-[90vw]">
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-gray-600">
            A verification code has been sent to your email address ({email}). 
            Please enter the code below to complete your login.
          </p>
          <Input
            type="text"
            placeholder="Enter verification code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full"
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleVerify} disabled={loading}>
            {loading ? 'Verifying...' : 'Verify'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TwoFactorModal;
