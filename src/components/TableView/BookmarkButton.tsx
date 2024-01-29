import { useContext } from 'react';
import { BookmarkContext, BookmarkContextType } from '../../contexts/BookmarkContext.tsx';


const BookmarkButton = ({ lectureCode }: { lectureCode: string }) => {
    const { bookmarkedSubjects, handleBookmarkToggle } = useContext<BookmarkContextType>(BookmarkContext);
    const isBookmarked = bookmarkedSubjects.has(lectureCode);

    return (
        <div className="star-button" onClick={() => handleBookmarkToggle(lectureCode)}>
            {isBookmarked ? "★" : "☆"}
        </div>
    );
};

export default BookmarkButton;
