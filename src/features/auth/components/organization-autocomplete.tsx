'use client';

import { useState, useEffect, useRef } from 'react';
import { searchOrganizations } from '@/features/auth/services';
import { OrganizationDTO } from '../types';

interface OrganizationAutocompleteProps {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onOrganizationSelect?: (org: OrganizationDTO | null) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
}

export function OrganizationAutocomplete({
  id,
  label,
  placeholder = 'Cari atau tambah organisasi...',
  value,
  onChange,
  onOrganizationSelect,
  onBlur,
  error,
  required = false,
}: OrganizationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<OrganizationDTO[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchTerm: string) => {
    onChange(searchTerm);

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (!searchTerm.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    // Debounce search - wait 500ms before making request
    const timeout = setTimeout(() => {
      performSearch(searchTerm);
    }, 500);

    setSearchTimeout(timeout);
  };

  const performSearch = async (searchTerm: string) => {
    setIsLoading(true);
    try {
      const response = await searchOrganizations(searchTerm);
      
      if (response.status === 200 && Array.isArray(response.data)) {
        setSuggestions(response.data || []);
      } else {
        setSuggestions([]);
      }
      setIsOpen(true);
    } catch (error) {
      setSuggestions([]);
      setIsOpen(true); // Still show add new option
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSuggestion = (org: OrganizationDTO) => {
    onChange(org.name);
    onOrganizationSelect?.(org);
    setIsOpen(false);
  };

  const handleAddNew = () => {
    if (value.trim()) {
      onOrganizationSelect?.(null);
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={e => handleSearch(e.target.value)}
          onFocus={() => value.trim() && setIsOpen(true)}
          onBlur={onBlur}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition text-sm text-gray-900 placeholder:text-gray-400 ${
            error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-primary'
            }`}
        />
        {isLoading && (
          <div className="absolute right-3 top-2.5">
            <div className="animate-spin h-5 w-5 text-gray-400">
              <svg
                className="w-full h-full"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && value.trim() && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {/* Existing Suggestions */}
          {suggestions.length > 0 && (
            <div>
              {suggestions.map(org => (
                <button
                  key={org.id}
                  type="button"
                  onClick={() => handleSelectSuggestion(org)}
                  className="w-full px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="font-medium text-gray-800">{org.name}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Add New Option */}
          {value.trim() && (
            <button
              type="button"
              onClick={handleAddNew}
              className="w-full px-4 py-3 text-left hover:bg-green-50 focus:bg-green-50 focus:outline-none transition border-t border-gray-200 flex items-center gap-2"
            >
              <span className="text-xl text-green-600 font-semibold">+</span>
              <div className="flex-1">
                <div className="font-medium text-gray-700">Tambah Organisasi Baru</div>
                <div className="text-sm text-gray-500">"{value}"</div>
              </div>
            </button>
          )}

          {/* No Results */}
          {suggestions.length === 0 && !isLoading && (
            <div className="px-4 py-3 text-center text-sm text-gray-500 border-t border-gray-200">
              Organisasi tidak ditemukan
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
