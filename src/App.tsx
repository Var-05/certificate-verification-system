import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { 
  Shield, 
  CheckCircle, 
  FileCheck, 
  Users, 
  Info, 
  Mic, 
  MicOff, 
  Upload, 
  Search, 
  PlusCircle, 
  AlertCircle,
  Menu,
  X,
  ChevronRight,
  Database,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Web3 from 'web3';

// --- Utils ---

const generateHash = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// --- Components ---

const Navbar = ({ walletAddress, connectWallet, isConnecting }: { walletAddress: string, connectWallet: () => Promise<string | null>, isConnecting: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const links = [
    { name: 'Home', path: '/', icon: Shield },
    { name: 'Verify', path: '/verify', icon: FileCheck },
    { name: 'Issue', path: '/issue', icon: PlusCircle },
    { name: 'Corporate Verify', path: '/corporate-verify', icon: Users },
    { name: 'About', path: '/about', icon: Info },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0c]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-blue-600 rounded-lg group-hover:rotate-12 transition-transform">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tighter text-white">Authentic<span className="text-blue-500">Chain</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link 
                key={link.path} 
                to={link.path} 
                className={`nav-link flex items-center gap-2 ${location.pathname === link.path ? 'text-blue-400' : ''}`}
              >
                <link.icon className="w-4 h-4" />
                {link.name}
              </Link>
            ))}
            
            <button 
              onClick={connectWallet}
              disabled={isConnecting}
              className="px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-lg text-blue-400 text-xs font-mono hover:bg-blue-600/20 transition-all flex items-center gap-2"
            >
              <div className={`w-2 h-2 rounded-full ${walletAddress ? 'bg-green-500' : 'bg-red-500'}`}></div>
              {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : (isConnecting ? 'Connecting...' : 'Connect Wallet')}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-slate-400 hover:text-white">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0a0a0c] border-b border-white/5 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {links.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all"
                >
                  <link.icon className="w-5 h-5" />
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const text = event.results[0][0].transcript.toLowerCase();
        setTranscript(text);
        handleVoiceCommand(text);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
    setResponse(text);
  };

  const handleVoiceCommand = (command: string) => {
    if (command.includes('verify a certificate')) {
      speak("To verify a certificate, go to the Verify page, upload your document, and our blockchain system will check its authenticity.");
    } else if (command.includes('blockchain verification')) {
      speak("Blockchain verification uses immutable ledger technology to store a unique hash of your document, making it impossible to forge.");
    } else if (command.includes('check pf details')) {
      speak("You can check PF details on the PF Verify page by entering the employee's PF number.");
    } else {
      speak("I'm sorry, I didn't catch that. You can ask about verifying certificates, blockchain, or PF details.");
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      setResponse('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {(transcript || response) && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-20 right-0 w-72 glass-card p-4 text-sm"
          >
            {transcript && (
              <div className="mb-2">
                <span className="text-blue-400 font-bold">You:</span> {transcript}
              </div>
            )}
            {response && (
              <div>
                <span className="text-purple-400 font-bold">Assistant:</span> {response}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <button 
        onClick={toggleListening}
        className={`p-4 rounded-full shadow-2xl transition-all duration-300 ${isListening ? 'bg-red-500 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        {isListening ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
      </button>
    </div>
  );
};

// --- Pages ---

const Home = () => (
  <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
    <div className="grid lg:grid-cols-2 gap-12 items-center">
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
          Securing Academic <br />
          <span className="gradient-text">Integrity</span> with Blockchain
        </h1>
        <p className="text-xl text-slate-400 mb-8 max-w-lg">
          AuthenticChain provides a decentralized, immutable platform for verifying academic certificates and employee credentials.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link to="/verify" className="btn-primary flex items-center gap-2">
            Verify Certificate <ChevronRight className="w-4 h-4" />
          </Link>
          <Link to="/pf-verify" className="btn-secondary">
            Employee Verification
          </Link>
        </div>
        
        <div className="mt-12 grid grid-cols-3 gap-8">
          <div>
            <div className="text-3xl font-bold text-white">100%</div>
            <div className="text-sm text-slate-500 uppercase tracking-widest">Immutable</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">Real-time</div>
            <div className="text-sm text-slate-500 uppercase tracking-widest">Verification</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">Web3</div>
            <div className="text-sm text-slate-500 uppercase tracking-widest">Powered</div>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-blue-500/20 blur-[120px] rounded-full"></div>
        <div className="glass-card p-8 relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="text-xs font-mono text-slate-500">NETWORK: ETHEREUM MAINNET</div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Database className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Block #84920{i}</div>
                    <div className="text-xs text-slate-500 font-mono">0x71C...3f4E</div>
                  </div>
                </div>
                <div className="text-green-400 text-xs font-bold">VERIFIED</div>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-center">
            <Cpu className="w-12 h-12 text-slate-700 animate-pulse" />
          </div>
        </div>
      </motion.div>
    </div>
  </div>
);

const VerifyCertificate = ({ walletAddress, connectWallet }: { walletAddress: string, connectWallet: () => Promise<string | null> }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<'genuine' | 'fake' | null>(null);
  const [certData, setCertData] = useState<any>(null);
  const [hash, setHash] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const verify = async () => {
    if (!file) return;
    
    let currentAddress = walletAddress;
    if (!currentAddress) {
      currentAddress = await connectWallet();
      if (!currentAddress) return; // User cancelled or failed
    }

    setIsVerifying(true);
    setResult(null);
    setCertData(null);
    
    try {
      const fileHash = await generateHash(file);
      setHash(fileHash);

      const response = await fetch('/api/verifyCertificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash: fileHash })
      });
      const data = await response.json();

      if (data.success) {
        setResult(data.isGenuine ? 'genuine' : 'fake');
        if (data.isGenuine) {
          setCertData(data.certificate);
        }
      } else {
        alert("Verification failed: " + data.message);
      }
    } catch (error) {
      console.error("Verification error:", error);
      alert("An error occurred during verification.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="pt-32 pb-20 px-4 max-w-3xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 md:p-12"
      >
        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-blue-600/20 rounded-2xl mb-4">
            <FileCheck className="w-10 h-10 text-blue-500" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Verify Certificate</h2>
          <p className="text-slate-400">Upload the document to verify its authenticity on the blockchain.</p>
          
          {!walletAddress && (
            <button 
              onClick={connectWallet}
              className="mt-4 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-400 text-xs font-bold hover:bg-orange-500/20 transition-all flex items-center gap-2 mx-auto"
            >
              <Shield className="w-4 h-4" /> Connect MetaMask to Verify
            </button>
          )}
        </div>

        <div className="space-y-6">
          <div className="border-2 border-dashed border-white/10 rounded-2xl p-10 text-center hover:border-blue-500/50 transition-all cursor-pointer relative">
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={handleFileChange}
            />
            <Upload className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-300 font-medium">
              {file ? file.name : 'Click or drag and drop to upload'}
            </p>
            <p className="text-xs text-slate-500 mt-2">PDF, PNG, JPG (Max 5MB)</p>
          </div>

          <button 
            onClick={verify}
            disabled={!file || isVerifying}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isVerifying ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Checking Blockchain...
              </>
            ) : (
              walletAddress ? 'Verify Authenticity' : 'Connect & Verify'
            )}
          </button>

          <AnimatePresence>
            {result && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-6 rounded-2xl flex flex-col gap-4 ${result === 'genuine' ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}
              >
                <div className="flex items-center gap-4">
                  {result === 'genuine' ? (
                    <>
                      <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0" />
                      <div>
                        <h4 className="text-green-400 font-bold">Genuine Certificate</h4>
                        <p className="text-sm text-green-500/80">Verified on AuthenticChain Network</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
                      <div>
                        <h4 className="text-red-400 font-bold">Fake or Forged Certificate</h4>
                        <p className="text-sm text-red-500/80">Not found in Official Registry</p>
                      </div>
                    </>
                  )}
                </div>

                {result === 'genuine' && certData && (
                  <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Student Name</p>
                        <p className="text-white font-medium">{certData.studentName}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Degree</p>
                        <p className="text-white font-medium">{certData.degree}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Issued By (Wallet)</p>
                        <p className="text-blue-400 font-mono text-xs break-all">{certData.issuer}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Timestamp</p>
                        <p className="text-slate-400 text-xs">{new Date(certData.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-2 p-3 bg-black/40 rounded-lg font-mono text-[10px] text-slate-400 break-all">
                  SHA-256 HASH: {hash}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

const IssueCertificate = ({ walletAddress, connectWallet }: { walletAddress: string, connectWallet: () => Promise<string | null> }) => {
  const [isIssuing, setIsIssuing] = useState(false);
  const [issued, setIssued] = useState(false);
  const [hash, setHash] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const issue = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let currentAddress = walletAddress;
    if (!currentAddress) {
      currentAddress = await connectWallet();
      if (!currentAddress) return;
    }

    if (!file) {
      alert("Please upload a document to generate a hash.");
      return;
    }

    setIsIssuing(true);
    setIssued(false);
    
    try {
      const fileHash = await generateHash(file);
      const studentName = (e.target as any)[0].value;
      const degree = (e.target as any)[1].value;

      const response = await fetch('/api/issueCertificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          hash: fileHash, 
          studentName, 
          degree,
          issuer: currentAddress
        })
      });
      const data = await response.json();

      if (data.success) {
        setHash(fileHash);
        setIssued(true);
      } else {
        alert("Issuance failed: " + data.message);
      }
    } catch (error) {
      console.error("Issuance error:", error);
      alert("An error occurred while issuing the certificate.");
    } finally {
      setIsIssuing(false);
    }
  };

  return (
    <div className="pt-32 pb-20 px-4 max-w-3xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 md:p-12"
      >
        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-purple-600/20 rounded-2xl mb-4">
            <PlusCircle className="w-10 h-10 text-purple-500" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Issue Certificate</h2>
          <p className="text-slate-400">Register a new academic document on the blockchain ledger.</p>
          
          {!walletAddress && (
            <button 
              onClick={connectWallet}
              className="mt-4 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-400 text-xs font-bold hover:bg-orange-500/20 transition-all flex items-center gap-2 mx-auto"
            >
              <Shield className="w-4 h-4" /> Connect MetaMask to Issue
            </button>
          )}
        </div>

        <form onSubmit={issue} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-slate-400">Student Name</label>
              <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all" placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-400">Degree / Course</label>
              <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all" placeholder="B.Tech Computer Science" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-400">Institution ID</label>
            <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all" placeholder="INST-9920" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-400">Upload Document Hash Source</label>
            <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center relative hover:border-purple-500/50 transition-all cursor-pointer">
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={handleFileChange}
              />
              <Upload className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-300">{file ? file.name : 'Upload file to generate unique blockchain hash'}</p>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isIssuing}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 bg-purple-600 hover:bg-purple-700 shadow-purple-900/20"
          >
            {isIssuing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Broadcasting to Network...
              </>
            ) : (
              walletAddress ? 'Issue & Secure on Blockchain' : 'Connect & Issue'
            )}
          </button>
        </form>

        <AnimatePresence>
          {issued && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-6 bg-green-500/10 border border-green-500/20 rounded-2xl"
            >
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-green-400 font-bold">Success! Certificate Issued</span>
              </div>
              <p className="text-sm text-green-500/80 mb-3">The certificate has been successfully mined into the blockchain.</p>
              <div className="p-3 bg-black/40 rounded-lg font-mono text-[10px] text-slate-400 break-all">
                TX_HASH: {hash}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

const CorporateVerify = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [employee, setEmployee] = useState<any>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setError('');
    setEmployee(null);

    try {
      const response = await fetch('/api/verifyEmployee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId })
      });
      const data = await response.json();
      
      if (data.success) {
        setEmployee(data.employee);
      } else {
        setError('Employee ID not found in our corporate registry.');
        // Redirect after a short delay
        setTimeout(() => navigate('/fresher'), 2000);
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="pt-32 pb-20 px-4 max-w-3xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 md:p-12"
      >
        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-emerald-600/20 rounded-2xl mb-4">
            <Users className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Corporate Verification</h2>
          <p className="text-slate-400">Verify employment history and professional credentials via corporate partner records.</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input 
              type="text" 
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 focus:border-emerald-500 outline-none transition-all" 
              placeholder="Enter Employee ID (e.g., EMP12345)" 
            />
          </div>
          <button 
            type="submit"
            disabled={isSearching}
            className="btn-primary bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20 px-8"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </form>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center"
            >
              {error} Redirecting to Fresher Registration...
            </motion.div>
          )}

          {employee && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Employee Name</div>
                    <div className="text-xl font-bold text-white">{employee.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Employee ID</div>
                    <div className="text-xl font-bold text-emerald-400">{employee.employeeId}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Last Organization</div>
                    <div className="text-lg text-slate-200">{employee.previousCompany}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Total Experience</div>
                    <div className="text-lg text-slate-200">{employee.experience}</div>
                  </div>
                  <div className="col-span-2 pt-4 border-t border-white/5">
                    <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Verified Salary Bracket</div>
                    <div className="text-2xl font-bold text-white">₹ {employee.salary}</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-emerald-500 text-sm font-medium">
                <CheckCircle className="w-4 h-4" /> Verified via Corporate Partner Registry
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

const FresherRegistration = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      name: formData.get('name'),
      age: formData.get('age'),
      degree: formData.get('degree'),
      college: formData.get('college'),
      skills: formData.get('skills'),
      expectedSalary: formData.get('expectedSalary'),
    };

    try {
      const response = await fetch('/api/registerFresher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      
      if (result.success) {
        navigate(`/fresher-profile/${result.id}`);
      } else {
        alert("Registration failed: " + result.message);
      }
    } catch (error) {
      alert("An error occurred during registration.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-20 px-4 max-w-3xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 md:p-12"
      >
        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-blue-600/20 rounded-2xl mb-4">
            <PlusCircle className="w-10 h-10 text-blue-500" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Fresher Registration</h2>
          <p className="text-slate-400">Create a new profile for candidates without existing corporate records.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-slate-400">Full Name</label>
              <input name="name" type="text" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all" placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-400">Age</label>
              <input name="age" type="number" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all" placeholder="22" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-400">Degree</label>
              <input name="degree" type="text" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all" placeholder="B.E. Mechanical" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-400">College</label>
              <input name="college" type="text" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all" placeholder="IIT Bombay" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-400">Skills (Comma separated)</label>
            <input name="skills" type="text" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all" placeholder="React, Python, SQL" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-400">Expected Salary (Annual)</label>
            <input name="expectedSalary" type="text" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all" placeholder="6,00,000" />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Registering...' : 'Complete Registration'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const FresherProfile = () => {
  const { id } = useParams();
  const [fresher, setFresher] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/fresher/${id}`);
        const data = await response.json();
        if (data.success) {
          setFresher(data.fresher);
        }
      } catch (error) {
        console.error("Failed to fetch profile");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (isLoading) return <div className="pt-40 text-center text-slate-400">Loading Profile...</div>;
  if (!fresher) return <div className="pt-40 text-center text-red-500">Profile Not Found</div>;

  return (
    <div className="pt-32 pb-20 px-4 max-w-3xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 md:p-12"
      >
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-blue-500/30">
            <Users className="w-12 h-12 text-blue-500" />
          </div>
          <h2 className="text-3xl font-bold mb-1">{fresher.name}</h2>
          <p className="text-blue-400 font-mono text-sm tracking-widest">{fresher.id}</p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-xs">
            <CheckCircle className="w-3 h-3" /> Registered Candidate
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 py-8 border-y border-white/5">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Academic Qualification</p>
            <p className="text-white font-medium">{fresher.degree}</p>
            <p className="text-slate-400 text-sm">{fresher.college}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Age</p>
            <p className="text-white font-medium">{fresher.age} Years</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Technical Skills</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {fresher.skills.split(',').map((skill: string) => (
                <span key={skill} className="px-2 py-1 bg-white/5 rounded-md text-xs text-slate-300 border border-white/10">
                  {skill.trim()}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Expected Salary</p>
            <p className="text-white font-medium">₹ {fresher.expectedSalary}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link to="/corporate-verify" className="flex-1 btn-primary text-center">Back to Verification</Link>
          <button onClick={() => window.print()} className="flex-1 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all">
            Download Profile
          </button>
        </div>
        
        <p className="mt-8 text-center text-[10px] text-slate-600">
          Registered on: {new Date(fresher.registeredAt).toLocaleString()}
        </p>
      </motion.div>
    </div>
  );
};

const About = () => (
  <div className="pt-32 pb-20 px-4 max-w-4xl mx-auto">
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-8 md:p-12"
    >
      <h2 className="text-4xl font-bold mb-8 gradient-text">About AuthenticChain</h2>
      
      <div className="space-y-8 text-slate-300 leading-relaxed">
        <section>
          <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" /> The Problem
          </h3>
          <p>
            Academic fraud and credential falsification are growing concerns globally. Traditional verification methods are slow, manual, and prone to manipulation. HR departments often struggle to verify previous employment history accurately.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-500" /> Our Blockchain Solution
          </h3>
          <p>
            AuthenticChain leverages the Ethereum blockchain to create a permanent, tamper-proof record of academic achievements. By hashing documents and storing these hashes on a decentralized ledger, we ensure that any modification to the document will immediately invalidate its authenticity.
          </p>
        </section>

        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
            <h4 className="font-bold text-white mb-2">Smart Contracts</h4>
            <p className="text-sm text-slate-400">Automated logic for issuing and verifying hashes directly on-chain.</p>
          </div>
          <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
            <h4 className="font-bold text-white mb-2">PF Integration</h4>
            <p className="text-sm text-slate-400">Secure backend API to verify professional history via PF records.</p>
          </div>
        </div>

        <section className="pt-8 border-t border-white/5">
          <p className="text-sm text-slate-500 italic">
            Developed as a Final Year Project to demonstrate the practical application of Web3 and Full-Stack technologies in enterprise security.
          </p>
        </section>
      </div>
    </motion.div>
  </div>
);

// --- Main App ---

export default function App() {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        setIsConnecting(true);
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
        return accounts[0];
      } catch (error) {
        console.error("Wallet connection failed:", error);
        return null;
      } finally {
        setIsConnecting(false);
      }
    } else {
      alert("Please install MetaMask to use this feature.");
      return null;
    }
  };

  return (
    <Router>
      <div className="min-h-screen font-sans">
        <Navbar walletAddress={walletAddress} connectWallet={connectWallet} isConnecting={isConnecting} />
        
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/verify" element={<VerifyCertificate walletAddress={walletAddress} connectWallet={connectWallet} />} />
            <Route path="/issue" element={<IssueCertificate walletAddress={walletAddress} connectWallet={connectWallet} />} />
            <Route path="/corporate-verify" element={<CorporateVerify />} />
            <Route path="/fresher" element={<FresherRegistration />} />
            <Route path="/fresher-profile/:id" element={<FresherProfile />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>


        <VoiceAssistant />

        <footer className="py-12 border-t border-white/5 bg-[#0a0a0c]">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-blue-500" />
              <span className="font-bold text-white">AuthenticChain</span>
            </div>
            <p className="text-slate-500 text-sm">© 2026 AuthenticChain. Built for Academic Integrity.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}
