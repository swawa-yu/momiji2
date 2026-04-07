import React, { useContext } from 'react';

import { BookmarkContext } from '../../contexts/BookmarkContext';
import { filterSubjectCodeList } from '../../search';
import { subject2Map, subjectMap } from '../../subject';
import { SearchOptions } from '../../types/search';
import ReactTableComponent from './ReactTableComponent';

interface TableViewProps {
  searchOptions: SearchOptions;
}

function TableView({ searchOptions }: TableViewProps) {
  // const filteredSubjectCodeList = React.useMemo(() => filterSubjectCodeList(searchOptions), [searchOptions]);
  // const filteredSubjectCodes = filterSubjectCodeList(searchOptions);
  const bookmarkedSubjects = useContext(BookmarkContext).bookmarkedSubjects;
  const filteredSubjectCodes = React.useMemo(
    () => filterSubjectCodeList(searchOptions, bookmarkedSubjects),
    [searchOptions, bookmarkedSubjects]
  );

  const filteredSubjects = React.useMemo(() => {
    return filteredSubjectCodes.map((subjectCode) => subjectMap[subjectCode]);
  }, [filteredSubjectCodes]);
  const filteredSubjects2 = React.useMemo(() => {
    return filteredSubjectCodes.map((subjectCode) => subject2Map[subjectCode]);
  }, [filteredSubjectCodes]);

  const subjects2ToShow = React.useMemo(() => {
    return filteredSubjects2;
  }, [filteredSubjects2]);

  return (
    <div>
      <div className="table-wrapper">該当授業数: {filteredSubjects.length}</div>
      <ReactTableComponent
        subjectsToShow={subjects2ToShow}
      ></ReactTableComponent>
    </div>
  );
}

export default TableView;
