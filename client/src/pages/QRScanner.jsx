import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';
import { Camera, CheckCircle, XCircle, QrCode as QrCodeIcon, Keyboard } from 'lucide-react';
import toast from 'react-hot-toast';
import Webcam from 'react-webcam';
import { BrowserQRCodeReader } from '@zxing/library';

export default function QRScanner() {
  const { user } = useAuthStore();
  const [scanning, setScanning] = useState(false);
  const [qrInput, setQrInput] = useState('');
  const [result, setResult] = useState(null);
  const [scanMode, setScanMode] = useState('camera'); // 'camera' or 'manual'
  const [cameraError, setCameraError] = useState(null);
  const webcamRef = useRef(null);
  const codeReaderRef = useRef(null);

  useEffect(() => {
    let scanInterval;
    let isActive = true;
    
    if (scanMode === 'camera') {
      codeReaderRef.current = new BrowserQRCodeReader();
      
      // Wait for webcam to be ready
      const initScanner = setTimeout(() => {
        if (isActive) {
          startScanning();
          // Continuous scanning every 300ms for better responsiveness
          scanInterval = setInterval(() => {
            if (isActive && !scanning && webcamRef.current?.video) {
              scanFrame();
            }
          }, 300);
        }
      }, 1000);

      return () => {
        isActive = false;
        clearTimeout(initScanner);
        clearInterval(scanInterval);
        if (codeReaderRef.current) {
          codeReaderRef.current.reset();
        }
      };
    }

    return () => {
      isActive = false;
      clearInterval(scanInterval);
    };
  }, [scanMode]);

  const scanFrame = async () => {
    if (!codeReaderRef.current || !webcamRef.current?.video || scanning) return;

    try {
      const videoElement = webcamRef.current.video;
      
      if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
        // Use decodeFromImage to avoid restarting the stream
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        
        const result = await codeReaderRef.current.decodeFromImage(undefined, canvas.toDataURL());
        
        if (result && result.getText()) {
          processQRCode(result.getText());
        }
      }
    } catch (err) {
      // Silently handle decode errors (happens when no QR code is visible)
      if (err.name !== 'NotFoundException') {
        console.error('Scanner error:', err);
      }
    }
  };

  const startScanning = async () => {
    // Scanner will be handled by the interval, no initial scan needed
    console.log('Scanner initialized and ready');
  };

  const processQRCode = async (qrCode) => {
    setScanning(true);
    setQrInput(qrCode);
    
    try {
      // Check if QR session exists and is active
      const qrSessionRes = await axios.get(`http://localhost:8000/qrSessions?qrCode=${qrCode}&active=true`);
      
      if (qrSessionRes.data.length === 0) {
        setResult({ 
          success: false, 
          message: `This QR code is not valid for attendance. Please use the QR code displayed by your lecturer.`,
          scannedCode: qrCode
        });
        toast.error('Invalid QR code for attendance');
        setScanning(false);
        
        // Reset after 3 seconds to allow scanning again
        setTimeout(() => {
          if (scanMode === 'camera') {
            setResult(null);
            setScanning(false);
          }
        }, 3000);
        return;
      }

      const qrSession = qrSessionRes.data[0];
      
      // Check if already marked attendance for this session
      const existingAttendance = await axios.get(
        `http://localhost:8000/attendance?studentId=${user.id}&qrSessionId=${qrSession.id}`
      );
      
      if (existingAttendance.data.length > 0) {
        setResult({ success: false, message: 'Attendance already marked for this session' });
        toast.error('Already marked attendance');
        setScanning(false);
        return;
      }

      // Mark attendance
      await axios.post('http://localhost:8000/attendance', {
        studentId: user.id,
        unitId: qrSession.unitId,
        classId: qrSession.classId,
        date: qrSession.date,
        time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        status: 'present',
        qrSessionId: qrSession.id
      });

      // Update user stats
      await axios.patch(`http://localhost:8000/users/${user.id}`, {
        attendedClasses: (user.attendedClasses || 0) + 1,
        totalClasses: (user.totalClasses || 0) + 1
      });

      setResult({ success: true, message: 'Attendance marked successfully! \u2713' });
      toast.success('Attendance recorded!');
      
    } catch (error) {
      console.error('Error marking attendance:', error);
      setResult({ success: false, message: 'Failed to mark attendance. Please try again.' });
      toast.error('Error marking attendance');
    } finally {
      setScanning(false);
    }
  };

  const handleManualSubmit = () => {
    if (!qrInput.trim()) {
      toast.error('Please enter a QR code');
      return;
    }
    processQRCode(qrInput);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">QR Check-in</h1>
          <p className="text-gray-600">Enter or scan the QR code to mark attendance</p>
        </div>

        {!result ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Mode Toggle */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setScanMode('camera')}
                className={`flex-1 px-6 py-4 font-semibold transition-colors flex items-center justify-center gap-2 ${
                  scanMode === 'camera'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Camera size={20} />
                Scan with Camera
              </button>
              <button
                onClick={() => setScanMode('manual')}
                className={`flex-1 px-6 py-4 font-semibold transition-colors flex items-center justify-center gap-2 ${
                  scanMode === 'manual'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Keyboard size={20} />
                Enter Manually
              </button>
            </div>

            <div className="p-8">
              {scanMode === 'camera' ? (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Scan QR Code</h2>
                    <p className="text-sm text-gray-600">Position the QR code within the camera frame</p>
                    {!scanning && !cameraError && (
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-600 font-medium">Camera active - ready to scan</span>
                      </div>
                    )}
                  </div>

                  {cameraError ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                      <p className="text-sm text-red-800 mb-3">{cameraError}</p>
                      <button
                        onClick={() => {
                          setCameraError(null);
                          setScanMode('manual');
                        }}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Switch to manual entry
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="overflow-hidden rounded-xl border-4 border-blue-600 bg-black">
                        <Webcam
                          ref={webcamRef}
                          audio={false}
                          screenshotFormat="image/jpeg"
                          mirrored={false}
                          videoConstraints={{
                            facingMode: { ideal: 'environment' },
                            width: { ideal: 1280 },
                            height: { ideal: 720 },
                            frameRate: { ideal: 30 }
                          }}
                          onUserMedia={() => {
                            console.log('Camera started successfully');
                            setCameraError(null);
                          }}
                          onUserMediaError={(err) => {
                            console.error('Camera error:', err);
                            setCameraError('Unable to access camera. Please check permissions or use manual entry.');
                          }}
                          className="w-full h-auto"
                          style={{ 
                            maxHeight: '500px', 
                            objectFit: 'cover',
                            display: 'block'
                          }}
                        />
                        {/* Scanning overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-64 h-64 border-4 border-blue-500 rounded-lg relative">
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg"></div>
                          </div>
                        </div>
                      </div>
                      {scanning && (
                        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center rounded-xl">
                          <div className="bg-white rounded-lg p-6 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
                            <p className="text-sm font-semibold text-gray-900">Processing QR Code...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-700">
                      <strong>Tip:</strong> Hold your device steady and ensure good lighting for faster scanning.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <div className="w-32 h-32 mx-auto mb-4 bg-blue-50 rounded-xl flex items-center justify-center border-2 border-blue-200">
                      <QrCodeIcon className="w-16 h-16 text-blue-600" />
                    </div>
                    
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Enter QR Code</h2>
                    <p className="text-sm text-gray-600">Type the code from your lecturer's display</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      QR Code
                    </label>
                    <input
                      type="text"
                      value={qrInput}
                      onChange={(e) => setQrInput(e.target.value)}
                      placeholder="e.g., QR-u1-20251210-0830"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={scanning}
                      onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
                    />
                  </div>

                  <button
                    onClick={handleManualSubmit}
                    disabled={scanning || !qrInput.trim()}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {scanning ? 'Processing...' : 'Mark Attendance'}
                  </button>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-700">
                      <strong>Note:</strong> QR codes are displayed by your lecturer during class. They expire 30 minutes after class ends.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={`bg-white rounded-xl shadow-sm p-8 border-2 ${
            result.success ? 'border-green-500' : 'border-red-500'
          }`}>
            <div className="text-center">
              {result.success ? (
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
              ) : (
                <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
              )}
              
              <h2 className={`text-2xl font-bold mb-2 ${
                result.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {result.success ? 'Success!' : 'Invalid QR Code'}
              </h2>
              
              <p className="text-base text-gray-700 mb-4">{result.message}</p>

              {result.scannedCode && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Scanned Code:</p>
                  <p className="text-sm font-mono text-gray-800 break-all">{result.scannedCode}</p>
                  <p className="text-xs text-gray-600 mt-2">
                    This code is not recognized as a valid attendance QR code.
                  </p>
                </div>
              )}

              <button
                onClick={() => {
                  setResult(null);
                  setQrInput('');
                  setScanning(false);
                }}
                className={`w-full py-3 rounded-lg font-semibold text-white ${
                  result.success ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                } transition-colors`}
              >
                {result.success ? 'Done' : 'Scan Again'}
              </button>
            </div>
          </div>
        )}

        {user?.graceUnitsRemaining !== undefined && !result && (
          <div className="mt-6 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Grace Units</h3>
            <p className="text-gray-600 text-sm mb-3">
              Grace units help maintain your streak when you're late or miss class.
            </p>
            <div className="flex items-center gap-2">
              {[...Array(user.graceUnitsTotal || 2)].map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-3 rounded-full ${
                    i < (user.graceUnitsRemaining || 0) ? 'bg-orange-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {user.graceUnitsRemaining || 0} of {user.graceUnitsTotal || 2} remaining (resets monthly)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
