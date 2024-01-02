import React, { useContext } from 'react';
import { BookmarkContext, BookmarkContextType } from './contexts/BookmarkContext';
import './ExportBookmarkButton.css'

const downloadCSV = (csvString: string) => {
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // ダウンロードリンクの作成
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bookmark.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


// TODO: bookmarkedSubjectsを引数に取るべきか
const ExportBookmarkButton: React.FC<{}> = () => {
    const { bookmarkedSubjects } = useContext<BookmarkContextType>(BookmarkContext);
    const handleExport = () => {
        const csvString = Array.from(bookmarkedSubjects).join('\n');
        downloadCSV(csvString);
    };

    return (
        <div className='export-bookmark-button-container'>
            <button onClick={handleExport}>ブックマークをエクスポート</button>
        </div>
    )
};

export default ExportBookmarkButton;