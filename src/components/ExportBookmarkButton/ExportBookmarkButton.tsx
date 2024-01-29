import React, { useContext } from 'react';
import { BookmarkContext, BookmarkContextType } from '../../contexts/BookmarkContext';
import './ExportBookmarkButton.css'
import { subject2Map } from '../../subject';
import { convertURLtoAbsolute } from '../../subject/utils';

const downloadCSV = (csvString: string) => {
    const BOM = "\uFEFF"; // UTF-8のBOM
    const blob = new Blob([BOM + csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // 現在の日付をyyyy-mm-dd形式で取得
    const date = new Date();
    const formattedDate = date.toISOString().slice(0, 10); // ISO文字列からyyyy-mm-dd部分のみを取得

    // ダウンロードリンクの作成
    const link = document.createElement('a');
    link.href = url;
    link.download = `hirodai-subject-bookmark-${formattedDate}.csv`; // ファイル名に日付を組み込む
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


// TODO: bookmarkedSubjectsを引数に取るべきか
const ExportBookmarkButton: React.FC<{}> = () => {
    const { bookmarkedSubjects } = useContext<BookmarkContextType>(BookmarkContext);
    const handleExport = () => {
        const csvString = "講義コード,授業科目名,URL\n" +
            Array.from(bookmarkedSubjects).map(subjectCode =>
                `"${subject2Map[subjectCode]["講義コード"]}","${subject2Map[subjectCode]["授業科目名"]}","${convertURLtoAbsolute(subject2Map[subjectCode]["relative URL"])}"`
            ).join('\n');
        downloadCSV(csvString);
    };

    return (
        <div className='export-bookmark-button-container'>
            <button onClick={handleExport}>ブックマークをエクスポート</button>
        </div>
    )
};

export default ExportBookmarkButton;