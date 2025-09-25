import React from "react";
import HeroImage from "../../assets/hero.svg";

const features = () => {
    const featerCards = [
        {
            title: "Immutable Certificates",
            description:
                "Every certificate is minted as an NFT on the Ethereum blockchain, ensuring it's tamper-proof, permanent, and publicly verifiable.",
            gradient: "from-cyan-400 via-blue-500 to-indigo-600",
            bgColor: "bg-cyan-500/15",
            textColor: "text-cyan-400",
            borderColor: "border-cyan-500/30",
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
            ),
        },
        {
            title: "Authentic Ownership",
            description:
                "Certificates are linked to your Ethereum wallet, ensuring undeniable proof of ownership and authenticity.",
            gradient: "from-emerald-400 via-teal-500 to-cyan-600",
            bgColor: "bg-emerald-500/15",
            textColor: "text-emerald-400",
            borderColor: "border-emerald-500/30",
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
                </svg>
            ),
        },
        {
            title: "Fraud Protection",
            description:
                "Built-in blockchain security ensures that certificates cannot be forged, copied, or tampered with by unauthorized users.",
            gradient: "from-rose-400 via-pink-500 to-purple-600",
            bgColor: "bg-rose-500/15",
            textColor: "text-rose-400",
            borderColor: "border-rose-500/30",
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
            ),
        },
        {
            title: "Global Verifiability",
            description:
                "Anyone can verify a certificate instantly through its blockchain record, making it shareable with employers, schools, and institutions globally.",
            gradient: "from-violet-400 via-purple-500 to-fuchsia-600",
            bgColor: "bg-violet-500/15",
            textColor: "text-violet-400",
            borderColor: "border-violet-500/30",
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3s-4.5 4.03-4.5 9 2.015 9 4.5 9Zm0 0V9m0 12c-2.485 0-4.5-4.03-4.5-9s2.015-9 4.5-9 4.5 4.03 4.5 9-2.015 9-4.5 9Zm-9.716-6.747C3.124 14.39 4.862 15 6.75 15s3.626-.61 4.566-1.747m-9.716 0a9.004 9.004 0 0 1-.05-3.747c.99-1.137 2.728-1.747 4.616-1.747s3.626.61 4.566 1.747m-9.716 6.494c.99 1.137 2.728 1.747 4.616 1.747s3.626-.61 4.566-1.747" />
                </svg>
            ),
        },
    ];


    return (
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 relative overflow-hidden">
            {/* Advanced Background with Multiple Layers */}
            <div className="absolute inset-0">
                <img
                    src={HeroImage}
                    alt="Hero background"
                    className="absolute top-0 left-0 w-full h-full object-cover opacity-20 sm:opacity-25 md:opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950/98 via-blue-950/95 to-purple-950/98" />
                
                {/* Responsive Animated Background Elements */}
                <div className="absolute top-10 left-2 sm:top-20 sm:left-10 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 xl:w-80 xl:h-80 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-2xl sm:blur-3xl animate-pulse" />
                <div className="absolute bottom-10 right-2 sm:bottom-20 sm:right-10 w-28 h-28 sm:w-40 sm:h-40 md:w-56 md:h-56 lg:w-72 lg:h-72 xl:w-72 xl:h-72 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-2xl sm:blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 sm:w-96 sm:h-96 md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] xl:w-[500px] xl:h-[500px] bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-2xl sm:blur-3xl animate-spin-slow" />
            </div>

            {/* Modern Header Section */}
            <div className="max-w-7xl mx-auto text-center mb-12 sm:mb-16 md:mb-20 lg:mb-24 xl:mb-28 relative z-10 px-3 sm:px-4 md:px-6 lg:px-8">
                <div className="relative">
                    {/* Background Glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/15 via-blue-400/15 to-purple-400/15 sm:from-cyan-400/20 sm:via-blue-400/20 sm:to-purple-400/20 blur-2xl sm:blur-3xl rounded-full" />
                    
                    {/* Main Title */}
                    <h2 className="relative text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-7xl 2xl:text-8xl font-black tracking-tighter leading-[0.85] pb-4 sm:pb-6 mb-6 sm:mb-8 max-w-6xl mx-auto">
                        <span className="block bg-gradient-to-r from-white via-cyan-200 to-blue-200 text-transparent bg-clip-text drop-shadow-2xl mb-1 sm:mb-2">
                            Revolutionary
                        </span>
                        <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 text-transparent bg-clip-text">
                            Features
                        </span>
                        
                        {/* Responsive Decorative Line */}
                        <div className="absolute -bottom-1 sm:-bottom-2 left-1/2 transform -translate-x-1/2 w-20 sm:w-24 md:w-28 lg:w-32 h-0.5 sm:h-1 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full" />
                        <div className="absolute -bottom-0.5 sm:-bottom-1 left-1/2 transform -translate-x-1/2 w-20 sm:w-24 md:w-28 lg:w-32 h-0.5 sm:h-1 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full blur-sm opacity-70" />
                    </h2>
                </div>
                
                {/* Enhanced Subtitle */}
                <div className="relative max-w-xs sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-4xl mx-auto">
                    <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl 2xl:text-2xl font-light leading-relaxed text-gray-100/90 mt-4 sm:mt-6 md:mt-8 px-2 sm:px-4 tracking-wide max-w-4xl mx-auto">
                        <span className="font-medium bg-gradient-to-r from-gray-100 to-gray-300 text-transparent bg-clip-text">
                            Experience the future of 
                        </span>
                        <br className="block sm:hidden" />
                        <span className="font-bold bg-gradient-to-r from-cyan-400 to-blue-400 text-transparent bg-clip-text mx-1 sm:mx-2">
                            digital certification
                        </span>
                        <br className="block sm:hidden" />
                        <span className="font-medium bg-gradient-to-r from-gray-100 to-gray-300 text-transparent bg-clip-text">
                            powered by blockchain technology
                        </span>
                    </p>
                    
                    {/* Responsive Floating Elements */}
                    <div className="hidden sm:block absolute -top-2 sm:-top-4 -left-2 sm:-left-4 w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full opacity-60 animate-float" />
                    <div className="hidden sm:block absolute -bottom-2 sm:-bottom-4 -right-2 sm:-right-4 w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-60 animate-float-delay" />
                </div>
            </div>

            {/* Modern Features Grid */}
            <div className="px-3 sm:px-4 md:px-6 lg:px-8 mx-auto max-w-6xl relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-8 xl:gap-10 md:items-stretch">
                    {featerCards.map((card, index) => (
                        <div key={index} className="group relative h-full">
                            {/* Advanced Background Effects */}
                            <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white/5 via-white/2 to-transparent backdrop-blur-sm" />
                            <div className={`absolute -inset-0.5 sm:-inset-1 bg-gradient-to-r ${card.gradient} rounded-2xl sm:rounded-3xl blur-lg sm:blur-xl opacity-8 sm:opacity-10 group-hover:opacity-25 sm:group-hover:opacity-30 transition-all duration-500`} />
                            
                            {/* Glassmorphism Card */}
                            <div className={`
                                relative p-4 xs:p-5 sm:p-6 md:p-8 lg:p-9 xl:p-10 rounded-2xl sm:rounded-3xl backdrop-blur-2xl border border-white/10
                                transition-all duration-500 group-hover:border-white/20
                                transform group-hover:-translate-y-1 sm:group-hover:-translate-y-2 md:group-hover:-translate-y-3 group-hover:scale-[1.01] sm:group-hover:scale-[1.02]
                                bg-gradient-to-br from-white/10 via-white/5 to-transparent
                                shadow-lg sm:shadow-xl md:shadow-2xl group-hover:shadow-2xl sm:group-hover:shadow-3xl md:group-hover:shadow-4xl
                                overflow-hidden h-full flex flex-col
                            `}>
                                {/* Responsive Floating Background Orbs */}
                                <div className={`absolute top-2 right-2 sm:top-4 sm:right-4 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-28 xl:h-28 bg-gradient-to-r ${card.gradient} rounded-full opacity-3 sm:opacity-5 blur-xl sm:blur-2xl transition-all duration-700 group-hover:scale-125 sm:group-hover:scale-140 group-hover:opacity-8 sm:group-hover:opacity-10`} />
                                <div className={`absolute bottom-2 left-2 sm:bottom-4 sm:left-4 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 xl:w-20 xl:h-20 bg-gradient-to-r ${card.gradient} rounded-full opacity-3 sm:opacity-5 blur-xl sm:blur-2xl transition-all duration-700 group-hover:scale-110 sm:group-hover:scale-120 group-hover:opacity-8 sm:group-hover:opacity-10`} />
                                
                                {/* Modern Card Header */}
                                <div className="relative z-10 mb-4 sm:mb-6 md:mb-8">
                                    {/* Responsive Icon with Advanced Design */}
                                    <div className={`
                                        inline-flex items-center justify-center w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 xl:w-20 xl:h-20 mb-3 sm:mb-4 md:mb-6
                                        rounded-xl sm:rounded-2xl bg-gradient-to-br ${card.bgColor} border border-white/20
                                        transform group-hover:rotate-6 sm:group-hover:rotate-12 group-hover:scale-105 sm:group-hover:scale-110 
                                        transition-all duration-500 shadow-lg sm:shadow-xl backdrop-blur-sm
                                        relative overflow-hidden
                                    `}>
                                        <div className={`absolute inset-0 bg-gradient-to-r ${card.gradient} opacity-10`} />
                                        <div className={`relative ${card.textColor} transform group-hover:scale-110 sm:group-hover:scale-125 transition-transform duration-300`}>
                                            <div className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 xl:w-9 xl:h-9">
                                                {card.icon}
                                            </div>
                                        </div>
                                        <div className={`absolute inset-0 bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-15 sm:group-hover:opacity-20 transition-opacity duration-300`} />
                                    </div>
                                    
                                    {/* Responsive Modern Title Design */}
                                    <h3 className="relative">
                                        <span className={`
                                            block text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl font-black tracking-tight leading-[1.1] mb-2 sm:mb-3 md:mb-4
                                            bg-gradient-to-r ${card.gradient} text-transparent bg-clip-text
                                            group-hover:scale-102 sm:group-hover:scale-105 transition-transform duration-300 origin-left
                                        `}>
                                            {card.title}
                                        </span>
                                        
                                        {/* Responsive Dynamic Underline */}
                                        <div className="relative">
                                            <div className={`h-0.5 sm:h-1 md:h-1.5 bg-gradient-to-r ${card.gradient} rounded-full transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500`} />
                                            <div className={`absolute top-0 h-0.5 sm:h-1 md:h-1.5 w-full bg-gradient-to-r ${card.gradient} rounded-full blur-sm opacity-0 group-hover:opacity-50 sm:group-hover:opacity-60 transition-opacity duration-500`} />
                                        </div>
                                    </h3>
                                </div>
                                
                                {/* Responsive Enhanced Description */}
                                <div className="relative z-10 flex-grow flex items-center">
                                    <p className="text-sm xs:text-base sm:text-lg md:text-lg lg:text-xl xl:text-xl leading-relaxed font-light text-gray-200/85 sm:text-gray-200/90 group-hover:text-white/90 sm:group-hover:text-white/95 transition-all duration-300 tracking-wide">
                                        {card.description}
                                    </p>
                                </div>
                                
                                {/* Responsive Modern Interactive Elements */}
                                <div className="absolute bottom-0 left-0 right-0">
                                    {/* Responsive Gradient Line */}
                                    <div className={`h-0.5 sm:h-1 bg-gradient-to-r ${card.gradient} transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-700`} />
                                    
                                    {/* Responsive Corner Accents */}
                                    <div className={`absolute bottom-0 left-0 w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-20 sm:group-hover:opacity-30 transition-opacity duration-500 transform rotate-45 -translate-x-2 sm:-translate-x-3 md:-translate-x-4 translate-y-2 sm:translate-y-3 md:translate-y-4`} />
                                    <div className={`absolute bottom-0 right-0 w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-20 sm:group-hover:opacity-30 transition-opacity duration-500 transform rotate-45 translate-x-2 sm:translate-x-3 md:translate-x-4 translate-y-2 sm:translate-y-3 md:translate-y-4`} />
                                </div>
                                
                                {/* Responsive Hover Shimmer Effect */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 sm:via-white/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default features;
