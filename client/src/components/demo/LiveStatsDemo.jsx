import React, { useState, useEffect } from 'react';

const LiveStatsDemo = () => {
    const [stats, setStats] = useState({
        totalCertificates: 12847,
        verifiedCertificates: 12683,
        authorizedInstitutions: 127,
        onlineUsers: 42
    });

    const [recentActivities] = useState([
        "Certificate verified in Germany 2 min ago",
        "Smart Contract course completed in Canada 4 min ago", 
        "New institution joined from Brazil 6 min ago",
        "DeFi certification issued in Japan 8 min ago",
        "Verification completed in 2.3 seconds 10 min ago"
    ]);

    // Simulate real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prev => ({
                ...prev,
                totalCertificates: prev.totalCertificates + Math.floor(Math.random() * 3),
                verifiedCertificates: prev.verifiedCertificates + Math.floor(Math.random() * 2),
                onlineUsers: 30 + Math.floor(Math.random() * 40)
            }));
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const formatNumber = (num) => num.toLocaleString();

    return (
        <div className="bg-gray-900 text-white p-8 rounded-lg shadow-xl max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
                🚀 Live Hero Section Demo
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
                {/* Real-time Statistics */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-blue-400">📊 Live Statistics</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-800 rounded">
                            <span>Total Certificates:</span>
                            <span className="font-bold text-green-400 transition-all duration-500">
                                {formatNumber(stats.totalCertificates)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-800 rounded">
                            <span>Verified Certificates:</span>
                            <span className="font-bold text-green-400 transition-all duration-500">
                                {formatNumber(stats.verifiedCertificates)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-800 rounded">
                            <span>Partner Institutions:</span>
                            <span className="font-bold text-purple-400">
                                {stats.authorizedInstitutions}+
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-800 rounded">
                            <span className="flex items-center">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                                Users Online:
                            </span>
                            <span className="font-bold text-yellow-400 transition-all duration-500">
                                {stats.onlineUsers}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Recent Activities */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-purple-400">⚡ Recent Activities</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {recentActivities.map((activity, index) => (
                            <div 
                                key={index}
                                className="p-3 bg-gray-800 rounded text-sm flex items-start space-x-2"
                            >
                                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-gray-300">{activity}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Features Demonstration */}
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg border border-violet-500/30">
                <h3 className="text-lg font-semibold mb-4 text-center">✨ Enhanced Features</h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                        <div className="text-2xl mb-2">🔴</div>
                        <div className="font-semibold">Live Activity Ticker</div>
                        <div className="text-gray-400">Real-time blockchain events</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl mb-2">📈</div>
                        <div className="font-semibold">Dynamic Statistics</div>
                        <div className="text-gray-400">Auto-updating blockchain data</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl mb-2">🎯</div>
                        <div className="font-semibold">Real Certificates</div>
                        <div className="text-gray-400">Latest issued certificates</div>
                    </div>
                </div>
            </div>

            <div className="mt-6 text-center text-sm text-gray-400">
                <p>🔄 Statistics update every 5 seconds • Activity ticker rotates every 3 seconds</p>
                <p className="mt-2">This demo shows how the enhanced Hero section will look with real blockchain data!</p>
            </div>
        </div>
    );
};

export default LiveStatsDemo; 