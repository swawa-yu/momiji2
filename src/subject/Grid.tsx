import { VariableSizeGrid, GridChildComponentProps } from "react-window";

const columnWidths = new Array(1000)
    .fill(true)
    .map(() => 75 + Math.round(Math.random() * 50));
const rowHeights = new Array(1000)
    .fill(true)
    .map(() => 25 + Math.round(Math.random() * 50));

const Cell = ({ columnIndex, rowIndex, style }: GridChildComponentProps) => (
    <div style={style}>
        Item {rowIndex},{columnIndex}
    </div>
);

const Grid = () => {
    return (
        <VariableSizeGrid
            width={300}
            height={150}
            columnCount={1000}
            rowCount={1000}
            columnWidth={(index) => columnWidths[index]}
            rowHeight={(index) => rowHeights[index]}
        >
            {Cell}
        </VariableSizeGrid>
    );
};

export default Grid