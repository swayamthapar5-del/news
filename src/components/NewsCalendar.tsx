import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { DailyNewsService } from '../services/dailyNewsService';

interface NewsCalendarProps {
  onDateSelect: (date: string) => void;
  selectedDate: string | null;
}

const NewsCalendar: React.FC<NewsCalendarProps> = ({ onDateSelect, selectedDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  useEffect(() => {
    setAvailableDates(DailyNewsService.getAvailableDates());
  }, []);

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const hasNewsForDate = (date: Date): boolean => {
    const dateString = formatDate(date);
    return DailyNewsService.hasNewsForDate(dateString);
  };

  const handleDateClick = (date: Date) => {
    const dateString = formatDate(date);
    onDateSelect(dateString);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    const today = formatDate(new Date());
    onDateSelect(today);
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
        </div>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3 sm:mb-4">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs sm:text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {Array.from({ length: firstDay }).map((_, index) => (
          <div key={`empty-${index}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const dateString = formatDate(date);
          const hasNews = hasNewsForDate(date);
          const isSelected = selectedDate === dateString;
          const isToday = formatDate(new Date()) === dateString;

          return (
            <button
              key={day}
              onClick={() => handleDateClick(date)}
              disabled={!hasNews}
              className={`
                relative p-2 sm:p-3 rounded-lg text-xs sm:text-sm font-medium transition-all
                ${hasNews 
                  ? 'cursor-pointer hover:bg-primary-50' 
                  : 'text-gray-300 cursor-not-allowed'
                }
                ${isSelected 
                  ? 'bg-primary-600 text-white hover:bg-primary-700' 
                  : ''
                }
                ${isToday && !isSelected 
                  ? 'border-2 border-primary-600' 
                  : ''
                }
              `}
              aria-label={`View news for ${monthNames[currentDate.getMonth()]} ${day}`}
            >
              {day}
              {hasNews && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
                  <div className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                </div>
              )}
              {isSelected && hasNews && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={goToToday}
          className="flex items-center gap-2 px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
        >
          <CalendarIcon className="w-4 h-4" />
          Today
        </button>
        <div className="text-sm text-gray-500">
          {availableDates.length} day{availableDates.length !== 1 ? 's' : ''} with news
        </div>
      </div>
    </div>
  );
};

export default NewsCalendar;
