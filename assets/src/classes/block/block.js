class Block{
  static size = 30
  image = "error"
  blockX = 0
  blockY = 0
  chunk = {x:0,y:0}
  size = 1
  tick(){}
  draw(){
    drawImg(this.image, this.x, this.y, this.size * Block.size, this.size * Block.size)
  }
  get x(){
    return (this.blockX + this.chunk.x) * Block.size
  }
  get y(){
    return (this.blockY + this.chunk.y) * Block.size
  }
}