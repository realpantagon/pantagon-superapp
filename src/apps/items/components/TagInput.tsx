import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../shared/utils/supabase';

interface TagInputProps {
    value: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
    className?: string; // Add className prop
}

export default function TagInput({ value = [], onChange, placeholder = "Add tags...", className = "" }: TagInputProps) {
    // Ensure value is always an array
    const safeValue = Array.isArray(value) ? value : [];

    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [allTags, setAllTags] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchTags();
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const fetchTags = async () => {
        try {
            // Fetch all unique tags from the database
            // This is a bit tricky with Postgres arrays in Supabase directly if we want unique *tags* across all rows without a separate tags table.
            // A simple approach for now: fetch all items, map tags, flat, unique.
            // Or if there is a separate tags table/view, use that.
            // Assuming we just query items for now. An RPC would be better for performance in long run.
            const { data } = await supabase
                .from('Pantagon_items')
                .select('tags');

            if (data) {
                const uniqueTags = Array.from(new Set(
                    data
                        .flatMap(item => item.tags || [])
                        .filter(Boolean)
                )) as string[];
                setAllTags(uniqueTags.sort());
            }
        } catch (error) {
            console.error('Error fetching tags:', error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);

        if (val.trim()) {
            const filtered = allTags.filter(tag =>
                tag.toLowerCase().includes(val.toLowerCase()) &&
                !safeValue.includes(tag)
            );
            setSuggestions(filtered);
            setIsOpen(true);
        } else {
            setSuggestions([]);
            setIsOpen(false);
        }
    };

    const addTag = (tag: string) => {
        const trimmedTag = tag.trim();
        if (trimmedTag && !safeValue.includes(trimmedTag)) {
            onChange([...safeValue, trimmedTag]);
            setInputValue('');
            setSuggestions([]);
            setIsOpen(false);
        }
    };

    const removeTag = (tagToRemove: string) => {
        onChange(safeValue.filter(tag => tag !== tagToRemove));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag(inputValue);
        } else if (e.key === 'Backspace' && !inputValue && safeValue.length > 0) {
            removeTag(safeValue[safeValue.length - 1]);
        }
    };

    return (
        <div className={`relative ${className}`} ref={wrapperRef}>
            <div className="flex flex-wrap gap-2 p-2 bg-gray-900/60 border border-gray-700/50 rounded-lg min-h-[42px] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                {safeValue.map(tag => (
                    <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded bg-blue-500/20 text-blue-300 text-sm border border-blue-500/30"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:text-white focus:outline-none"
                        >
                            ×
                        </button>
                    </span>
                ))}
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        // Show all unused tags when focusing empty input
                        const available = allTags.filter(t => !safeValue.includes(t));
                        setSuggestions(available);
                        setIsOpen(true);
                    }}
                    placeholder={safeValue.length === 0 ? placeholder : ""}
                    className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 min-w-[80px]"
                />
            </div>

            {isOpen && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.map(tag => (
                        <button
                            key={tag}
                            type="button"
                            onClick={() => addTag(tag)}
                            className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors"
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
