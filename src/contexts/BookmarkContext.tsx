import React, { createContext, useState } from 'react';

// BookmarkContext の型を定義する
export interface BookmarkContextType {
  bookmarkedSubjects: Set<string>;
  handleBookmarkToggle: (lectureCode: string) => void;
}

// createContext に型とデフォルト値を適用する
export const BookmarkContext = createContext<BookmarkContextType>({
  bookmarkedSubjects: new Set(),
  handleBookmarkToggle: () => {},
});

const BOOKMARK_STORAGE_KEY = 'bookmarkedSubjects';

const loadBookmarkedSubjects = (): Set<string> => {
  if (typeof window === 'undefined') {
    return new Set();
  }

  try {
    const stored = window.localStorage.getItem(BOOKMARK_STORAGE_KEY);
    if (!stored) {
      return new Set();
    }
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return new Set();
    }
    return new Set(parsed.filter((item) => typeof item === 'string'));
  } catch (error) {
    console.warn('Failed to load bookmarked subjects from localStorage', error);
    return new Set();
  }
};

const saveBookmarkedSubjects = (subjects: Set<string>) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const serialized = JSON.stringify(Array.from(subjects));
    window.localStorage.setItem(BOOKMARK_STORAGE_KEY, serialized);
  } catch (error) {
    console.warn('Failed to save bookmarked subjects to localStorage', error);
  }
};

export const BookmarkProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [bookmarkedSubjects, setBookmarkedSubjects] = useState<Set<string>>(
    loadBookmarkedSubjects
  );

  const handleBookmarkToggle = (lectureCode: string) => {
    setBookmarkedSubjects((prev) => {
      const newBookmarks = new Set(prev);
      if (newBookmarks.has(lectureCode)) {
        newBookmarks.delete(lectureCode);
      } else {
        newBookmarks.add(lectureCode);
      }
      saveBookmarkedSubjects(newBookmarks);
      return newBookmarks;
    });
  };

  return (
    <BookmarkContext.Provider
      value={{ bookmarkedSubjects, handleBookmarkToggle }}
    >
      {children}
    </BookmarkContext.Provider>
  );
};
