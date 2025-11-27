import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

const BadgeCard = ({ badge, isEarned, progress }) => {
  return (
    <Card 
      className={`relative overflow-hidden transition-all duration-300 ${
        isEarned 
          ? 'shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer' 
          : 'opacity-50 grayscale hover:opacity-70'
      }`}
    >
      {/* Gradient background for earned badges */}
      {isEarned && (
        <div 
          className={`absolute inset-0 bg-gradient-to-br ${badge.color} opacity-10`}
        />
      )}
      
      <div className="relative p-4 sm:p-6">
        {/* Badge icon */}
        <div className="text-center mb-3">
          <div className={`mb-2 ${
            badge.iconSize === 'small' ? 'text-2xl sm:text-3xl' : 'text-4xl sm:text-5xl'
          } ${isEarned ? 'animate-bounce-slow' : ''}`}>
            {badge.icon}
          </div>
          
          {/* Badge name */}
          <h3 className={`font-bold text-base sm:text-lg ${
            isEarned ? 'text-foreground' : 'text-muted-foreground'
          }`}>
            {badge.name}
          </h3>
        </div>
        
        {/* Description */}
        <p className="text-xs sm:text-sm text-muted-foreground text-center mb-3">
          {badge.description}
        </p>
        
        {/* Requirement/Status */}
        <div className="text-center">
          {isEarned ? (
            <Badge 
              className={`bg-gradient-to-r ${badge.color} text-white border-0`}
            >
              ✓ Earned
            </Badge>
          ) : (
            <div className="space-y-1">
              <Badge variant="outline" className="text-xs">
                {badge.requirement}
              </Badge>
              {progress && (
                <div className="mt-2">
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {Math.min(progress.current, progress.required)}/{progress.required}
                    </span>
                    {progress.extraInfo && (
                      <span className="text-xs">({progress.extraInfo})</span>
                    )}
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-muted rounded-full h-1.5 mt-1.5">
                    <div 
                      className={`h-1.5 rounded-full bg-gradient-to-r ${badge.color} transition-all duration-500`}
                      style={{ 
                        width: `${Math.min((progress.current / progress.required) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Shine effect for earned badges */}
      {isEarned && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-20 transition-opacity duration-500 transform -skew-x-12" />
      )}
    </Card>
  );
};

export default BadgeCard;
