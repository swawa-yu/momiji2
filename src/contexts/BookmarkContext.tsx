import React, { createContext, useState } from 'react';

// BookmarkContext の型を定義する
interface BookmarkContextType {
    bookmarkedSubjects: Set<string>;
    handleBookmarkToggle: (lectureCode: string) => void;
}

// createContext に型とデフォルト値を適用する
export const BookmarkContext = createContext<BookmarkContextType>({
    bookmarkedSubjects: new Set(),
    handleBookmarkToggle: () => { }
});

export const BookmarkProvider = ({ children }: { children: React.ReactNode }) => {
    const [bookmarkedSubjects, setBookmarkedSubjects] = useState<Set<string>>(new Set());

    const handleBookmarkToggle = (lectureCode: string) => {
        setBookmarkedSubjects(prev => {
            const newBookmarks = new Set(prev);
            if (newBookmarks.has(lectureCode)) {
                newBookmarks.delete(lectureCode);
            } else {
                newBookmarks.add(lectureCode);
            }
            return newBookmarks;
        });
    };

    return (
        <BookmarkContext.Provider value={{ bookmarkedSubjects, handleBookmarkToggle }}>
            {children}
        </BookmarkContext.Provider>
    );
};
