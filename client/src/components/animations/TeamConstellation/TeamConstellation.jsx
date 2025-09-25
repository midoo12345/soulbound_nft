import { useEffect, useMemo, useRef, useState } from 'react';
import HeroImage from "../../../assets/hero.svg";
import imgMoaaz from "../../../assets/team/moaaz.jpg";
import imgEslam from "../../../assets/team/eslam.jpg";
import imgHamdy from "../../../assets/team/hamdy.jpg";
import imgMario from "../../../assets/team/mario.png";
import imgHussien from "../../../assets/team/hussien.jpg";
import imgMohamed from "../../../assets/team/mohamed.jpg";

const defaultPeople = [
  { 
    name: 'Hamdy Emad Hamdy', 
    field: 'Blockchain Developer', 
    img: imgHamdy,
    title: 'Genesis Block Creator',
    tokenId: '#GENESIS',
    rarity: 'Legendary',
    skills: ['Web3', 'Solidity', 'Architecture', 'Penetration Testing'],
    achievements: 15,
    level: 100,
    isGenesis: true,
    linkedin: 'https://www.linkedin.com/in/hamdy-emad-hamdy-mosa'
  },
  { 
    name: 'Hussein Mohsen El Gendy', 
    field: 'Back End Developer', 
    img: imgHussien,
    title: 'Mangment Master',
    tokenId: '#0001',
    rarity: 'Legendary',
    skills: ['PHP', 'Solidity', 'Architecture'],
    achievements: 11,
    level: 100,
    linkedin: 'https://www.linkedin.com/in/hussien-algendy-8b8886284'
  },
  { 
    name: 'Islam Ahmed Hassan', 
    field: 'Full Stack Developer', 
    img: imgEslam,
    title: 'Code Master',
    tokenId: '#0002', 
    rarity: 'Epic',
    skills: ['React.js', 'TypeScript', '.NET', 'C#'],
    achievements: 8,
    level: 100,
    linkedin: 'https://www.linkedin.com/in/rxrow'
  },
  { 
    name: 'Mario Atef Girgis', 
    field: 'Front End Developer', 
    img: imgMario,
    title: 'UI Designer',
    tokenId: '#0003',
    rarity: 'Epic',
    skills: ['React.js', 'Figma', 'UI/UX'],
    achievements: 7,
    level: 100,
    linkedin: 'https://www.linkedin.com/in/mario-atef-9aa818342'
  },
  { 
    name: 'Moaaz Atef Fouad', 
    field: 'Front End Developer', 
    img: imgMoaaz,
    title: 'UI Designer',
    tokenId: '#0004',
    rarity: 'Legendary',
    skills: ['React.js', 'UI/UX', 'Figma'],
    achievements: 12,
    level: 100,
    linkedin: 'https://www.linkedin.com/in/moaaz-atef-9404472a2'
  },
  { 
    name: 'Mohamed Mahmoud Farag', 
    field: 'cybersecurity Engineer', 
    img: imgMohamed,
    title: 'Security Expert',
    tokenId: '#0005',
    rarity: 'Rare',
    skills: ['web3 security', 'monitoring', 'analysis'],
    achievements: 9,
    level: 100,
    linkedin: 'https://www.linkedin.com/in/mohammed-m-farag'
  },
];

const rarityColors = {
  'Legendary': 'from-yellow-400 via-orange-500 to-red-500',
  'Epic': 'from-purple-400 via-pink-500 to-purple-600', 
  'Rare': 'from-blue-400 via-cyan-500 to-blue-600',
  'Common': 'from-gray-400 via-gray-500 to-gray-600'
};

export default function TeamConstellation({ people = defaultPeople }) {
  const containerRef = useRef(null);
  const [activeCard, setActiveCard] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [mintAnimation, setMintAnimation] = useState(null);
  
  // Generate real blockchain hashes
  const generateHash = (data) => {
    let hash = 0;
    const str = JSON.stringify(data);
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0').slice(0, 8);
  };

  // Create blockchain with proper sequential hash references
  const blockchainData = people.reduce((chain, person, index) => {
    const blockData = {
      index,
      name: person.name,
      timestamp: Date.now() - (people.length - index) * 86400000, // Simulate blocks mined over days
      data: person,
      nonce: person.isGenesis ? 0 : Math.floor(Math.random() * 1000000)
    };
    
    // Calculate previous hash from the actual previous block in the chain
    const prevHash = index === 0 ? '00000000' : chain[index - 1].hash;
    
    // Calculate current block hash including the previous hash
    const currentHash = generateHash({ ...blockData, prevHash });
    
    const block = {
      ...person,
      blockIndex: index,
      hash: person.isGenesis ? 'GENESIS' + currentHash.slice(7) : currentHash,
      prevHash: prevHash,
      nonce: blockData.nonce,
      timestamp: blockData.timestamp
    };
    
    return [...chain, block];
  }, []);

  // LinkedIn redirect with mining animation
  const handleLinkedInRedirect = (person, index) => {
    // Start the mining animation
    setMintAnimation(index);
    
    // After 1.5 seconds of animation, redirect to LinkedIn
    setTimeout(() => {
      if (person.linkedin) {
        window.open(person.linkedin, '_blank');
      }
      // Reset animation after redirect
      setTimeout(() => setMintAnimation(null), 500);
    }, 1500);
  };

  return (
    <section ref={containerRef} className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      {/* Animated background */}
      <img
        src={HeroImage}
        alt="Hero background"
        className="absolute top-0 left-0 w-full h-full object-cover opacity-10"
      />

      {/* Digital Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(34,211,238,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34,211,238,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Floating blockchain elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400 rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes mint {
          0% { transform: scale(1) rotateY(0deg); opacity: 1; }
          25% { transform: scale(1.1) rotateY(90deg); opacity: 0.8; }
          50% { transform: scale(1.2) rotateY(180deg); opacity: 0.6; }
          75% { transform: scale(1.1) rotateY(270deg); opacity: 0.8; }
          100% { transform: scale(1) rotateY(360deg); opacity: 1; }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(34,211,238,0.5); }
          50% { box-shadow: 0 0 40px rgba(168,85,247,0.8); }
        }
        @keyframes reveal {
          0% { transform: rotateY(-90deg); opacity: 0; }
          100% { transform: rotateY(0deg); opacity: 1; }
        }
        @keyframes slideUp {
          0% { transform: translateY(50px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        /* Add new animation for LinkedIn redirect */
        @keyframes linkedinRedirect {
          0% { transform: scale(1); }
          25% { transform: scale(1.05); }
          50% { transform: scale(1.1); }
          75% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        .nft-card {
          transform-style: preserve-3d;
          perspective: 1000px;
        }
        .card-face {
          backface-visibility: hidden;
        }
        .card-back {
          transform: rotateY(180deg);
        }
      `}</style>

             <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-8 sm:py-12 lg:py-16 xl:py-20 2xl:py-24">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16 xl:mb-20 2xl:mb-24">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl 3xl:text-9xl font-black mb-3 sm:mb-4 lg:mb-6 xl:mb-8 2xl:mb-10 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 text-transparent bg-clip-text animate-pulse leading-tight">
            NFT TEAM COLLECTION
         </h2>
           <div className="flex items-center justify-center space-x-2 sm:space-x-3 lg:space-x-4 xl:space-x-5 2xl:space-x-6 mb-4 sm:mb-6 lg:mb-8 xl:mb-10 2xl:mb-12">
             <div className="h-0.5 sm:h-1 lg:h-1.5 xl:h-2 w-12 sm:w-16 lg:w-20 xl:w-24 2xl:w-28 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"></div>
             <span className="text-cyan-400 font-mono text-xs sm:text-sm lg:text-base xl:text-lg 2xl:text-xl">◆ BLOCKCHAIN CERTIFIED ◆</span>
             <div className="h-0.5 sm:h-1 lg:h-1.5 xl:h-2 w-12 sm:w-16 lg:w-20 xl:w-24 2xl:w-28 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
           </div>
           <p className="text-sm sm:text-base lg:text-lg xl:text-xl 2xl:text-2xl 3xl:text-3xl text-gray-300 max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl mx-auto leading-relaxed px-2">
             Exclusive collection of blockchain developers • Minted on academic network • Verified expertise
           </p>
        </div>

        {/* Blockchain Network */}
        <div className="relative max-w-7xl mx-auto">

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-8 2xl:gap-10 relative z-10 max-w-6xl mx-auto">
            {blockchainData.map((person, index) => (
              <div
                key={index}
                className={`blockchain-block group relative cursor-pointer transition-all duration-700 ${
                  activeCard === index ? 'scale-105 z-20' : 'hover:scale-105'
                }`}
                onClick={() => setActiveCard(activeCard === index ? null : index)}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  animation: `reveal 0.8s ease-out ${index * 0.2}s both`
                }}
              >
                {/* Block glow effect */}
                {/* Special Genesis Block Glow Effect */}
                <div className={`absolute -inset-2 ${person.isGenesis 
                  ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500' 
                  : `bg-gradient-to-r ${rarityColors[person.rarity]}`
                } rounded-lg blur opacity-30 group-hover:opacity-80 transition-opacity duration-500`}></div>
                
                {/* Genesis Block Special Indicators */}
                {person.isGenesis && (
                  <>
                    <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-xl blur-2xl opacity-15 animate-pulse"></div>
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-3 py-1 rounded-full border-2 border-yellow-300 shadow-lg z-20">
                      ⚡ GENESIS BLOCK ⚡
                    </div>
                  </>
                )}
                
                {/* Blockchain Block Structure */}
                <div className={`relative transition-all duration-500 ${
                  mintAnimation === index ? 'animate-pulse' : ''
                }`}>
                  
                  {/* Block Header */}
                  <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-t-lg p-2 sm:p-3 lg:p-4 xl:p-3 2xl:p-2 border-2 border-cyan-400/30 border-b-0">
                    <div className="flex items-center justify-between mb-1 sm:mb-2 lg:mb-2 xl:mb-2 2xl:mb-2">
                      <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-2 xl:space-x-2 2xl:space-x-2">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 lg:w-3 lg:h-3 xl:w-3 xl:h-3 2xl:w-3 2xl:h-3 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-green-400 font-mono text-xs sm:text-sm lg:text-sm xl:text-sm 2xl:text-sm">VERIFIED</span>
                      </div>
                      <div className="text-cyan-400 font-mono text-xs sm:text-sm lg:text-sm xl:text-sm 2xl:text-sm">
                        BLOCK #{index + 1}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-1 sm:gap-2 lg:gap-3 xl:gap-3 2xl:gap-3 text-xs sm:text-sm lg:text-sm xl:text-sm 2xl:text-sm font-mono">
                      <div>
                        <div className="text-gray-400">Hash:</div>
                        <div className={`truncate ${person.isGenesis ? 'text-yellow-300' : 'text-cyan-300'}`}>
                          0x{person.hash}...
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">Nonce:</div>
                        <div className={person.isGenesis ? 'text-yellow-300' : 'text-purple-300'}>
                          {person.nonce.toString().padStart(6, '0')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-1 sm:mt-2 lg:mt-2 xl:mt-2 2xl:mt-2 text-xs sm:text-sm lg:text-sm xl:text-sm 2xl:text-sm font-mono">
                      <div className="text-gray-400">Prev Hash:</div>
                      <div className={`truncate ${person.isGenesis ? 'text-yellow-300' : 'text-gray-500'}`}>
                        {person.isGenesis ? '0x00000000... (GENESIS)' : `0x${person.prevHash}...`}
                      </div>
                    </div>
                  </div>

                  {/* Block Body */}
                  <div className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 rounded-b-lg p-3 sm:p-4 lg:p-4 xl:p-3 2xl:p-2 border-2 border-cyan-400/30 border-t-0 backdrop-blur-xl">
                  
                    {/* Transaction data header */}
                    <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-3 xl:mb-3 2xl:mb-3 pb-1 sm:pb-2 lg:pb-2 xl:pb-2 2xl:pb-2 border-b border-cyan-400/20">
                      <span className="text-cyan-400 font-mono text-xs sm:text-sm lg:text-sm xl:text-sm 2xl:text-sm">TRANSACTION DATA</span>
                      <div className={`px-1.5 py-0.5 sm:px-2 sm:py-1 lg:px-2 lg:py-1 xl:px-2 xl:py-1 2xl:px-2 2xl:py-1 bg-gradient-to-r ${rarityColors[person.rarity]} text-white text-xs sm:text-sm lg:text-sm xl:text-sm 2xl:text-sm font-bold rounded`}>
                        {person.rarity}
                      </div>
                    </div>

                    {/* Developer Data Payload */}
                    <div className="relative mb-3 sm:mb-4 lg:mb-4 xl:mb-3 2xl:mb-2">
                      <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-cyan-400/30 group-hover:border-cyan-400/60 transition-all duration-500">
                        <img
                          src={person.img}
                          alt={person.name}
                          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                        />
                        
                        {/* Holographic overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/20 via-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        {/* Scan lines */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-60 transition-opacity duration-500">
                          {[...Array(8)].map((_, i) => (
                            <div
                              key={i}
                              className="absolute w-full h-0.5 bg-cyan-400/40"
                              style={{
                                top: `${i * 12.5}%`,
                                animation: `slideUp 0.3s ease-out ${i * 0.1}s both`
                              }}
                            />
                          ))}
                        </div>

                        {/* Blockchain overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                        
                        {/* Data indicators - Much smaller on laptop */}
                        <div className="absolute top-2 left-2 w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 bg-emerald-500/80 backdrop-blur-sm rounded-full border border-emerald-300/70 shadow-md shadow-emerald-500/30 flex items-center justify-center hover:scale-110 transition-all duration-300">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 lg:w-2.5 lg:h-2.5 xl:w-1.5 xl:h-1.5 2xl:w-2 2xl:h-2 bg-white rounded-full shadow-sm"></div>
                        </div>
                        
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded px-1 py-0.5 sm:px-1.5 sm:py-0.5 lg:px-2 lg:py-1 xl:px-1 xl:py-0.5 2xl:px-1.5 2xl:py-0.5 border border-cyan-400/60 shadow-sm">
                          <span className="text-cyan-300 font-mono text-xs sm:text-xs lg:text-sm xl:text-xs 2xl:text-sm font-semibold">{person.tokenId}</span>
                        </div>

                        {/* Mining progress - Much smaller on laptop */}
                        <div className="absolute bottom-2 left-2 right-2 sm:bottom-2 sm:left-2 sm:right-2 lg:bottom-3 lg:left-3 lg:right-3 xl:bottom-2 xl:left-2 xl:right-2 2xl:bottom-3 2xl:left-3 2xl:right-3 bg-slate-800/80 backdrop-blur-sm rounded px-1.5 py-1 sm:px-2 sm:py-1 lg:px-2.5 lg:py-1.5 xl:px-1.5 xl:py-1 2xl:px-2 2xl:py-1 border border-cyan-400/30">
                          <div className="flex items-center justify-between mb-0.5 sm:mb-0.5 lg:mb-1 xl:mb-0.5 2xl:mb-1">
                            <span className="text-cyan-400 font-mono text-xs sm:text-xs lg:text-sm xl:text-xs 2xl:text-sm">Power</span>
                            <span className="text-cyan-400 font-mono text-xs sm:text-xs lg:text-sm xl:text-xs 2xl:text-sm">{person.level}%</span>
                          </div>
                          <div className="w-full h-0.5 sm:h-0.5 lg:h-1 xl:h-0.5 2xl:h-1 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full bg-gradient-to-r ${rarityColors[person.rarity]} rounded-full transition-all duration-1000`}
                              style={{ width: `${person.level}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Block Validation Info */}
                    <div className="space-y-2 sm:space-y-3 lg:space-y-3 xl:space-y-3 2xl:space-y-3">
                      <div className="border border-cyan-400/30 rounded p-2 sm:p-3 lg:p-3 xl:p-3 2xl:p-3 bg-slate-800/50">
                        <div className="flex items-center justify-between mb-1 sm:mb-2 lg:mb-2 xl:mb-2 2xl:mb-2">
                          <span className="text-cyan-400 font-mono text-xs sm:text-sm lg:text-sm xl:text-sm 2xl:text-sm">DEVELOPER</span>
                          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-2 xl:space-x-2 2xl:space-x-2">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 lg:w-2 lg:h-2 xl:w-2 xl:h-2 2xl:w-2 2xl:h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-green-400 font-mono text-xs sm:text-sm lg:text-sm xl:text-sm 2xl:text-sm">VALIDATED</span>
                          </div>
                        </div>
                        <h3 className="text-sm sm:text-base lg:text-base xl:text-base 2xl:text-base font-bold text-white mb-1 sm:mb-1 lg:mb-1 xl:mb-1 2xl:mb-1 group-hover:text-cyan-400 transition-colors font-mono leading-tight">
                          {person.name}
                        </h3>
                        <p className="text-purple-400 font-semibold text-xs sm:text-sm lg:text-sm xl:text-sm 2xl:text-sm font-mono mb-1">{person.title}</p>
                        <p className="text-gray-400 text-xs sm:text-sm lg:text-sm xl:text-sm 2xl:text-sm font-mono">{person.field}</p>
                      </div>

                      {/* Blockchain Skills */}
                      <div className="border border-cyan-400/30 rounded p-2 sm:p-3 lg:p-3 xl:p-3 2xl:p-3 bg-slate-800/50">
                        <div className="text-cyan-400 font-mono text-xs sm:text-sm lg:text-sm xl:text-sm 2xl:text-sm mb-1 sm:mb-2 lg:mb-2 xl:mb-2 2xl:mb-2">SKILLS:</div>
                        <div className="grid grid-cols-1 gap-0.5 sm:gap-1 lg:gap-1 xl:gap-1 2xl:gap-1">
                          {person.skills.map((skill, skillIndex) => (
                            <div
                              key={skillIndex}
                              className="flex items-center justify-between text-xs sm:text-sm lg:text-sm xl:text-sm 2xl:text-sm font-mono"
                            >
                              <span className="text-gray-300">• {skill}</span>
                              <span className="text-green-400">✓</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Block Stats */}
                      <div className="border border-cyan-400/30 rounded p-2 sm:p-3 lg:p-3 xl:p-3 2xl:p-3 bg-slate-800/50">
                        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-3 xl:gap-3 2xl:gap-3 text-xs sm:text-sm lg:text-sm xl:text-sm 2xl:text-sm font-mono">
                          <div>
                            <div className="text-gray-400">COMMITS:</div>
                            <div className="text-yellow-400 font-bold">{person.achievements * 100}+</div>
                          </div>
                          <div>
                            <div className="text-gray-400">UPTIME:</div>
                            <div className="text-green-400 font-bold">99.{person.level}%</div>
                          </div>
                        </div>
                      </div>

                      {/* Block Validation */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLinkedInRedirect(person, index);
                        }}
                        className={`w-full py-2 sm:py-3 lg:py-3 xl:py-3 2xl:py-3 text-xs sm:text-sm lg:text-sm xl:text-sm 2xl:text-sm bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold font-mono rounded border border-cyan-400/50 hover:border-cyan-400 transform hover:scale-105 transition-all duration-300 ${
                          mintAnimation === index ? 'animate-pulse' : ''
                        }`}
                      >
                        {mintAnimation === index ? '⛏️ MINING...' : '🔗 VALIDATE'}
                      </button>
                    </div>
                    
                    {/* Blockchain pattern overlay */}
                    <div className="absolute inset-0 pointer-events-none opacity-5 rounded-lg overflow-hidden">
                      <div className="w-full h-full" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2322d3ee' fill-opacity='0.4'%3E%3Cpath d='M30 5l25 14.5v21L30 55 5 40.5v-21z'/%3E%3C/g%3E%3C/svg%3E")`,
                        backgroundSize: '30px 30px'
                      }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      {/* Blockchain Network Stats */}
      <div className="mt-8 sm:mt-12 lg:mt-16 xl:mt-20 2xl:mt-24 bg-slate-900/80 backdrop-blur-xl rounded-lg border-2 border-cyan-400/30 p-4 sm:p-6 lg:p-8 xl:p-10 2xl:p-12 max-w-6xl mx-auto">
          <div className="text-center mb-4 sm:mb-6 lg:mb-8 xl:mb-10 2xl:mb-12">
            <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl 3xl:text-5xl font-bold text-cyan-400 font-mono mb-2 lg:mb-3 xl:mb-4">NETWORK STATUS</h3>
            <div className="flex items-center justify-center space-x-2 lg:space-x-3">
              <div className="w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4 xl:w-5 xl:h-5 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-mono text-xs sm:text-sm lg:text-base xl:text-lg 2xl:text-xl">ONLINE • VALIDATED</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 xl:gap-8 2xl:gap-10">
            <div className="text-center p-3 sm:p-4 lg:p-5 xl:p-6 2xl:p-8 bg-slate-800/50 rounded border border-cyan-400/30">
              <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl 3xl:text-5xl font-bold text-cyan-400 mb-1 lg:mb-2 font-mono">{blockchainData.length}</div>
              <div className="text-gray-400 text-xs sm:text-sm lg:text-base xl:text-lg 2xl:text-xl font-mono">BLOCKS</div>
            </div>
            <div className="text-center p-3 sm:p-4 lg:p-5 xl:p-6 2xl:p-8 bg-slate-800/50 rounded border border-yellow-400/30">
              <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl 3xl:text-5xl font-bold text-yellow-400 mb-1 lg:mb-2 font-mono">
                {blockchainData.filter(person => person.rarity === 'Legendary').length}
              </div>
              <div className="text-gray-400 text-xs sm:text-sm lg:text-base xl:text-lg 2xl:text-xl font-mono">LEGENDARY</div>
            </div>
            <div className="text-center p-3 sm:p-4 lg:p-5 xl:p-6 2xl:p-8 bg-slate-800/50 rounded border border-purple-400/30">
              <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl 3xl:text-5xl font-bold text-purple-400 mb-1 lg:mb-2 font-mono">
                {blockchainData.filter(person => person.rarity === 'Epic').length}
              </div>
              <div className="text-gray-400 text-xs sm:text-sm lg:text-base xl:text-lg 2xl:text-xl font-mono">EPIC</div>
            </div>
            <div className="text-center p-3 sm:p-4 lg:p-5 xl:p-6 2xl:p-8 bg-slate-800/50 rounded border border-blue-400/30">
              <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl 3xl:text-5xl font-bold text-blue-400 mb-1 lg:mb-2 font-mono">
                {blockchainData.filter(person => person.rarity === 'Rare').length}
              </div>
              <div className="text-gray-400 text-xs sm:text-sm lg:text-base xl:text-lg 2xl:text-xl font-mono">RARE</div>
            </div>
          </div>

          <div className="mt-4 sm:mt-6 lg:mt-8 xl:mt-10 2xl:mt-12 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 xl:gap-8 text-xs sm:text-sm lg:text-base xl:text-lg 2xl:text-xl font-mono">
            <div className="text-center p-3 sm:p-4 lg:p-5 xl:p-6 bg-slate-800/30 rounded">
              <div className="text-gray-400 mb-1 lg:mb-2">HASH RATE</div>
              <div className="text-cyan-400 font-bold">847 TH/s</div>
            </div>
            <div className="text-center p-3 sm:p-4 lg:p-5 xl:p-6 bg-slate-800/30 rounded">
              <div className="text-gray-400 mb-1 lg:mb-2">BLOCK TIME</div>
              <div className="text-green-400 font-bold">2.1s</div>
            </div>
            <div className="text-center p-3 sm:p-4 lg:p-5 xl:p-6 bg-slate-800/30 rounded">
              <div className="text-gray-400 mb-1 lg:mb-2">UPTIME</div>
              <div className="text-yellow-400 font-bold">99.98%</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}