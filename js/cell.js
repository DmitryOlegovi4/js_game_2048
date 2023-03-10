export class Cell{
    constructor(gridElem, x, y){
        const cell = document.createElement('div');
        cell.classList.add('cell');
        gridElem.append(cell);
        this.x = x;
        this.y = y;
    }
    linkTile(tile){
        tile.setXY(this.x, this.y);
        this.linkedTile = tile;
    }
    isEmpty(){
        return !this.linkedTile;
    }
    unlinkTile(){
        this.linkedTile = null;
    }
    unlinkTileForMerge(){
        this.linkedTileForMerge = null;
    }
    linkTileForMerge(tile){
        tile.setXY(this.x, this.y);
        this.linkedTileForMerge = tile;
    }
    canAccept(newTile){
        return this.isEmpty() || (!this.hasTileForMerge() && this.linkedTile.value === newTile.value);
    }
    hasTileForMerge(){
        return !!this.linkedTileForMerge;
    }
    mergeTiles(){
        this.linkedTile.setValue(this.linkedTile.value + this.linkedTileForMerge.value);
        this.linkedTileForMerge.removeFromDOM();
        this.unlinkTileForMerge();
    }
}