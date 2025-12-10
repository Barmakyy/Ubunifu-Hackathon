import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Camera, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function QRScanner() {
  const { user } = useAuthStore();
  const [scanning, setScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [result, setResult] = useState(null);

  const handleScan = async () => {
    setScanning(true);
    
    // Simulate QR scan - replace with actual QR scanner library
    setTimeout(async () => {
      const code = 'QR-u1-20251210-0830'; // Demo code
      setScannedCode(code);
      
      try {
        const response = await api.post('/attendance', {
          studentId: user.id,
          qrCode: code,
          timestamp: new Date().toISOString()
        });
        
        if (response.data.success) {
          setShowConfetti(true);
          setResult({ success: true, message: 'You showed up. That counts! ✨' });
          toast.success('Attendance marked successfully!');
          
          setTimeout(() => setShowConfetti(false), 3000);
        }
      } catch (error) {
        if (error.response?.data?.graceUnitUsed) {
          setResult({ 
            success: true, 
            graceUsed: true,
            message: 'Grace unit used. Your streak is safe! 💫',
            remaining: error.response.data.graceUnitsRemaining
          });
          toast.success('Grace unit used!');
        } else {
          setResult({ success: false, message: error.response?.data?.message || 'Scan failed' });
          toast.error('Could not mark attendance');
        }
      } finally {
        setScanning(false);
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-cream-50 to-dusty-50 p-6">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                backgroundColor: ['#5a925a', '#e56b5a', '#8c6ac0', '#7099bd'][Math.floor(Math.random() * 4)],
                animationDelay: `${Math.random() * 2}s`,
                borderRadius: Math.random() > 0.5 ? '50%' : '0'
              }}
            />
          ))}
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-sage-800 mb-3">Scan to Check In</h1>
          <p className="text-sage-600 text-lg">Every presence matters. You're building something real.</p>
        </div>

        {!result ? (
          <div className="bg-white rounded-[1.5rem] shadow-xl p-8">
            {!scanning ? (
              <div className="text-center">
                <div className="w-64 h-64 mx-auto mb-6 bg-sage-50 rounded-[1.5rem] flex items-center justify-center border-4 border-dashed border-sage-300">
                  <Camera className="w-32 h-32 text-sage-400" />
                </div>
                
                <button
                  onClick={handleScan}
                  className="w-full bg-sage-500 text-white py-4 rounded-xl font-semibold text-lg hover:bg-sage-600 transition-all hover:scale-105"
                >
                  Start Scanning
                </button>

                <div className="mt-8 p-4 bg-cream-50 rounded-xl border-2 border-cream-200">
                  <p className="text-sm text-sage-700">
                    <span className="font-semibold">Tip:</span> Position the QR code in the center of the scanner. The code is available 30 minutes before class ends.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-64 h-64 mx-auto mb-6 bg-sage-100 rounded-[1.5rem] flex items-center justify-center border-4 border-sage-500 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sage-500/20 to-transparent animate-pulse-ring" />
                  <Camera className="w-32 h-32 text-sage-600 animate-gentle-bounce" />
                </div>
                
                <p className="text-sage-700 font-medium text-lg">Scanning...</p>
                <p className="text-sage-600 text-sm mt-2">Hold steady</p>
              </div>
            )}
          </div>
        ) : (
          <div className={`bg-white rounded-[1.5rem] shadow-xl p-8 border-4 ${
            result.success ? 'border-sage-500' : 'border-coral-500'
          }`}>
            <div className="text-center">
              {result.success ? (
                <CheckCircle className="w-24 h-24 text-sage-500 mx-auto mb-4" />
              ) : (
                <XCircle className="w-24 h-24 text-coral-500 mx-auto mb-4" />
              )}
              
              <h2 className={`text-2xl font-bold mb-2 ${
                result.success ? 'text-sage-800' : 'text-coral-800'
              }`}>
                {result.success ? 'Attendance Marked!' : 'Scan Failed'}
              </h2>
              
              <p className="text-lg text-sage-700 mb-6">{result.message}</p>

              {result.graceUsed && (
                <div className="mb-6 p-4 bg-violet-50 rounded-xl border-2 border-violet-200">
                  <p className="text-sm text-violet-800">
                    <span className="font-semibold">Grace Units Remaining:</span> {result.remaining}/2
                  </p>
                  <p className="text-xs text-violet-600 mt-1">
                    Grace units help you maintain your streak even when life happens. They reset monthly.
                  </p>
                </div>
              )}

              <button
                onClick={() => {
                  setResult(null);
                  setScannedCode('');
                }}
                className={`w-full py-4 rounded-xl font-semibold text-white ${
                  result.success ? 'bg-sage-500 hover:bg-sage-600' : 'bg-coral-500 hover:bg-coral-600'
                } transition-colors`}
              >
                {result.success ? 'Done' : 'Try Again'}
              </button>
            </div>
          </div>
        )}

        {user?.graceUnitsRemaining !== undefined && !result && (
          <div className="mt-6 p-6 bg-white rounded-xl shadow-md">
            <h3 className="font-semibold text-sage-800 mb-2">Your Safety Net</h3>
            <p className="text-sage-600 text-sm mb-3">
              Life happens. We understand. Use grace units when you're late or can't make it.
            </p>
            <div className="flex items-center gap-2">
              {[...Array(user.graceUnitsTotal || 2)].map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-3 rounded-full ${
                    i < (user.graceUnitsRemaining || 0) ? 'bg-sage-500' : 'bg-sage-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-sage-600 mt-2">
              {user.graceUnitsRemaining || 0} of {user.graceUnitsTotal || 2} grace units remaining
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
