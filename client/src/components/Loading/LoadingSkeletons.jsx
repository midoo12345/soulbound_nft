import React from 'react';

/**
 * Reusable Skeleton Components for Dashboard Loading States
 * Provides smooth, animated loading placeholders
 */

// Base skeleton animation class
const skeletonAnimation = "animate-pulse bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%]";

// StatCard Skeleton
export const StatCardSkeleton = ({ showProgress = true }) => (
  <div className="bg-gray-900/80 backdrop-blur-md rounded-lg shadow-xl p-6 border border-gray-800 relative overflow-hidden">
    {/* Digital corner accents */}
    <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-gray-700 rounded-tr-lg"></div>
    <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-gray-700 rounded-bl-lg"></div>
    
    <div className="flex items-center justify-between mb-4">
      {/* Icon skeleton */}
      <div className={`w-12 h-12 rounded-lg ${skeletonAnimation}`}></div>
      
      <div className="text-right space-y-2">
        {/* Title skeleton */}
        <div className={`h-4 w-24 rounded ${skeletonAnimation}`}></div>
        {/* Value skeleton */}
        <div className={`h-8 w-16 rounded ${skeletonAnimation}`}></div>
      </div>
    </div>
    
    {/* Digital line */}
    <div className="h-px w-full bg-gray-800/60 mb-6"></div>
    
    {/* Progress bar skeleton */}
    {showProgress && (
      <>
        <div className={`w-full h-1.5 rounded-full mb-3 ${skeletonAnimation}`}></div>
        <div className="flex justify-between">
          <div className="flex space-x-0.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`w-1 h-3 rounded-sm ${skeletonAnimation}`}></div>
            ))}
          </div>
          <div className={`h-3 w-8 rounded ${skeletonAnimation}`}></div>
        </div>
      </>
    )}
  </div>
);

// Analytics Section Skeleton
export const AnalyticsCardSkeleton = ({ title, rows = 4 }) => (
  <div className="bg-gray-900/80 backdrop-blur-md rounded-lg shadow-xl p-6 border border-gray-800 relative overflow-hidden">
    {/* Glowing accent */}
    <div className="absolute top-0 left-0 h-1 w-20 bg-indigo-500/60"></div>
    
    {/* Header */}
    <div className="flex items-center mb-4">
      <div className={`w-5 h-5 rounded mr-2 ${skeletonAnimation}`}></div>
      <div className={`h-5 w-32 rounded ${skeletonAnimation}`}></div>
    </div>
    
    {/* Content rows */}
    <div className="space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="flex justify-between items-center">
            <div className={`h-3 w-20 rounded ${skeletonAnimation}`}></div>
            <div className={`h-3 w-12 rounded ${skeletonAnimation}`}></div>
          </div>
          <div className={`w-full h-1.5 rounded-full ${skeletonAnimation}`}></div>
        </div>
      ))}
    </div>
    
    {/* Bottom section */}
    <div className="mt-6 p-3 bg-gray-800/30 rounded-lg border border-gray-700/20">
      <div className={`h-3 w-24 rounded mb-3 ${skeletonAnimation}`}></div>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex justify-between items-center mb-2">
          <div className={`h-2 w-16 rounded ${skeletonAnimation}`}></div>
          <div className={`h-2 w-8 rounded ${skeletonAnimation}`}></div>
        </div>
      ))}
    </div>
  </div>
);

// Quick Action Button Skeleton
export const QuickActionSkeleton = () => (
  <div className="flex flex-col items-center p-5 bg-gray-900/90 rounded-lg border border-gray-800 relative overflow-hidden">
    {/* Icon skeleton */}
    <div className={`w-12 h-12 rounded-lg mb-3 ${skeletonAnimation}`}></div>
    
    {/* Title skeleton */}
    <div className={`h-4 w-20 rounded mb-1 ${skeletonAnimation}`}></div>
    
    {/* Subtitle skeleton */}
    <div className={`h-3 w-24 rounded ${skeletonAnimation}`}></div>
  </div>
);

// Header Section Skeleton
export const DashboardHeaderSkeleton = () => (
  <div className="bg-gradient-to-r from-violet-950/80 to-indigo-950/80 rounded-lg shadow-lg border border-violet-500/30 backdrop-blur-sm relative overflow-hidden">
    {/* Glowing accent lines */}
    <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-violet-500/70 to-blue-500/70"></div>
    
    <div className="flex flex-col lg:flex-row justify-between p-8">
      <div className="flex-1">
        <div className="flex items-center space-x-4">
          {/* Icon skeleton */}
          <div className={`h-10 w-10 rounded ${skeletonAnimation}`}></div>
          
          <div className="space-y-2">
            {/* Title skeleton */}
            <div className={`h-8 w-48 rounded ${skeletonAnimation}`}></div>
            {/* Subtitle skeleton */}
            <div className={`h-4 w-32 rounded ${skeletonAnimation}`}></div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 lg:mt-0 flex items-center space-x-4">
        {/* Status cards skeleton */}
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white/5 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10">
            <div className={`h-3 w-16 rounded mb-1 ${skeletonAnimation}`}></div>
            <div className={`h-4 w-12 rounded ${skeletonAnimation}`}></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Full Dashboard Loading Skeleton
export const DashboardSkeleton = () => (
  <div className="bg-gray-950 min-h-screen text-gray-200 relative overflow-hidden">
    {/* Background elements */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-900/10 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-blue-900/10 rounded-full filter blur-3xl"></div>
    </div>
    
    <div className="relative z-10 py-6">
      <div className="max-w-[1600px] mx-auto px-4 space-y-8">
        {/* Header Skeleton */}
        <DashboardHeaderSkeleton />
        
        {/* Main Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        
        {/* Analytics Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AnalyticsCardSkeleton title="Certificate Status" rows={3} />
          <AnalyticsCardSkeleton title="Verification Analytics" rows={4} />
          <AnalyticsCardSkeleton title="Institution Analytics" rows={5} />
        </div>
        
        {/* Quick Actions Skeleton */}
        <div className="bg-gray-900/90 backdrop-blur-md rounded-lg shadow-xl border border-indigo-500/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className={`h-6 w-32 rounded ${skeletonAnimation}`}></div>
            <div className={`h-4 w-24 rounded ${skeletonAnimation}`}></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <QuickActionSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Network Status Skeleton
export const NetworkStatusSkeleton = () => (
  <div className="fixed top-4 right-4 bg-gray-900/90 backdrop-blur-md rounded-lg p-4 border border-gray-700 shadow-xl">
    <div className="flex items-center space-x-3">
      <div className={`w-3 h-3 rounded-full ${skeletonAnimation}`}></div>
      <div className={`h-4 w-24 rounded ${skeletonAnimation}`}></div>
    </div>
  </div>
);

// Analytics Page Skeleton
export const AnalyticsSkeleton = () => (
  <div className="space-y-8">
    {/* Header Skeleton */}
    <div className="bg-gray-900/90 backdrop-blur-md rounded-xl p-6 border border-gray-800/50">
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <div className={`h-8 w-64 rounded ${skeletonAnimation}`}></div>
          <div className={`h-4 w-96 rounded ${skeletonAnimation}`}></div>
        </div>
        <div className="flex space-x-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`w-24 h-12 rounded-lg ${skeletonAnimation}`}></div>
          ))}
        </div>
      </div>
    </div>

    {/* Navigation Skeleton */}
    <div className="bg-gray-900/80 backdrop-blur-md rounded-xl p-4 border border-gray-800/50">
      <div className="flex space-x-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`w-32 h-16 rounded-lg ${skeletonAnimation}`}></div>
        ))}
      </div>
    </div>

    {/* Content Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-gray-900/80 backdrop-blur-md rounded-xl p-6 border border-gray-800/50">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-8 h-8 rounded ${skeletonAnimation}`}></div>
            <div className={`w-16 h-6 rounded ${skeletonAnimation}`}></div>
          </div>
          <div className={`h-8 w-20 rounded mb-2 ${skeletonAnimation}`}></div>
          <div className={`h-4 w-32 rounded ${skeletonAnimation}`}></div>
        </div>
      ))}
    </div>
  </div>
);

export default {
  StatCardSkeleton,
  AnalyticsCardSkeleton,
  QuickActionSkeleton,
  DashboardHeaderSkeleton,
  DashboardSkeleton,
  NetworkStatusSkeleton
};
