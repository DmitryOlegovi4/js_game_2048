import { Grid } from "./grid.js";
import { Tile } from "./tile.js";
const result = document.querySelector('.result');
if(!localStorage.getItem('result')){
    localStorage.setItem('result', 0)
}
const gameBoard = document.getElementById("game-board");
let initialPoint, finalPoint;

const grid = new Grid(gameBoard);
grid.getRandomEmptyCell().linkTile(new Tile(gameBoard));
grid.getRandomEmptyCell().linkTile(new Tile(gameBoard));
setupInputOnce();

function setupInputOnce(){
    window.addEventListener('keydown', handleInput, {once: true})
    window.addEventListener('touchstart', handleInput, {once: true});
    window.addEventListener('touchend', handleInput, {once: true});
}

async function handleInput(event){
    switch(event.type){
        case "keydown":
            switch(event.key){
                case "ArrowUp":
                    if(!canMoveUp()){
                        setupInputOnce();
                        return;
                    }
                    await moveUp();
                    break;
                case "ArrowDown":
                    if(!canMoveDown()){
                        setupInputOnce();
                        return;
                    }
                    await moveDown();
                    break;
                case "ArrowRight":
                    if(!canMoveRight()){
                        setupInputOnce();
                        return;
                    }
                    await moveRight();
                    break;
                case "ArrowLeft":
                    if(!canMoveLeft()){
                        setupInputOnce();
                        return;
                    }
                    await moveLeft();
                    break;
                default:
                    setupInputOnce();
                    return;
            }
            addTile();
            break;
        case "touchstart":
            event.stopPropagation();
            initialPoint = event.changedTouches[0];
            return;
        case "touchend":
            event.preventDefault();
            event.stopPropagation();
            finalPoint = event.changedTouches[0];
            let xAbs = Math.abs(initialPoint.pageX - finalPoint.pageX),
                yAbs = Math.abs(initialPoint.pageY - finalPoint.pageY);
            if (xAbs > 20 || yAbs > 20) {
                if (xAbs > yAbs) {
                    if (finalPoint.pageX < initialPoint.pageX){
                        if(!canMoveLeft()){
                            setupInputOnce();
                            return;
                        }
                        await moveLeft();
                    }else{
                        if(!canMoveRight()){
                            setupInputOnce();
                            return;
                        }
                        await moveRight();
                    }
                }else {
                    if (finalPoint.pageY < initialPoint.pageY){
                        if(!canMoveUp()){
                            setupInputOnce();
                            return;
                        }
                        await moveUp();
                    }
                    else{
                        if(!canMoveDown()){
                            setupInputOnce();
                            return;
                        }
                        await moveDown();
                    }
                }
                addTile();
            }
    }
    function addTile(){
        const newTile = new Tile(gameBoard);
        grid.getRandomEmptyCell().linkTile(newTile);
    }

    if(!canMoveUp() && !canMoveDown() && !canMoveRight() && !canMoveLeft()){
        // разобраться с проблемой 
        // await newTile.waitForAnimationEnd();
        let tilesArr = document.querySelectorAll('.tile'), arr = [];
        for(let tile of tilesArr){
            arr.push(+tile.innerText)
        }
        console.log('Game Over');
        localStorage.setItem('result', Math.max.apply(null, arr))
        alert("Try Again");
        window.location.reload();
        return;
    }

    setupInputOnce();
}
async function moveUp(){
    await slideTiles(grid.cellsGroupedByColumn);
}
async function moveDown(){
    await slideTiles(grid.cellsGroupedByReversedColumn);
}
async function moveRight(){
    await slideTiles(grid.cellsGroupedByReversedRow);
}
async function moveLeft(){
    await slideTiles(grid.cellsGroupedByRow);
}
async function slideTiles(groupedCells){
    const promises = [];
    groupedCells.forEach(group => slideTilesInGroup(group, promises));
    await Promise.all(promises);
    grid.cells.forEach(cell => {
        cell.hasTileForMerge() && cell.mergeTiles();
    })
}
function slideTilesInGroup(group, promises){
    for(let i = 1; i < group.length; i++){
        if(group[i].isEmpty()){
            continue;
        }
        const cellWithTile = group[i];
        let targetCell;
        let j = i - 1;
        while(j >= 0 && group[j].canAccept(cellWithTile.linkedTile)){
            targetCell = group[j];
            j--;
        }
        if(!targetCell){
            continue;
        }
        promises.push(cellWithTile.linkedTile.waitForTransitionEnd());
        if(targetCell.isEmpty()){
            targetCell.linkTile(cellWithTile.linkedTile)
        } else{
            targetCell.linkTileForMerge(cellWithTile.linkedTile);
        }

        cellWithTile.unlinkTile();
    }
}

function canMoveUp(){
    return canMove(grid.cellsGroupedByColumn);
}
function canMoveDown(){
    return canMove(grid.cellsGroupedByReversedColumn);
}
function canMoveRight(){
    return canMove(grid.cellsGroupedByReversedRow);
}
function canMoveLeft(){
    return canMove(grid.cellsGroupedByRow);
}
function canMove(groupedCells){
    return groupedCells.some(group => canMoveInGroup(group));
}
function canMoveInGroup(group){
    return group.some((cell, i) => {
        if(i === 0) return false;
        if(cell.isEmpty()) return false;
        const targetCell = group[i-1];
        return targetCell.canAccept(cell.linkedTile);
    });
}


result.innerText = `${result.innerText} ${localStorage.getItem('result')}`
