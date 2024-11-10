class Item{
  holder = null
  get entity(){
    return this.holder
  }
  name = "<unnamed item>"
  description = "<no description>"
  rarity = 0
  stackSize = 99
  /**
   * 
   * @param {number} rarity Item rarity. 0 is most common. Must be between 0 and 5 inclusive.
   * @param {"light"|"dark"} [scheme="light"] Colour scheme **of the text**, not of the background.
   */
  static getColourFromRarity(rarity, scheme = "light"){
    switch (scheme){
      case "light":{
        switch(rarity){
          case 0:
            return [255, 255, 255]
          case 1:
            return [150, 255, 150]
          case 2:
            return [150, 150, 255]
          case 3:
            return [200, 150, 255]
          case 4:
            return [255, 200, 150]
          case 5:
            return [255, 150, 150]
        }
      }
      case "dark":{
        switch(rarity){
          case 0:
            return [0, 0, 0]
          case 1:
            return [0, 150, 0]
          case 2:
            return [0, 0, 150]
          case 3:
            return [100, 0, 150]
          case 4:
            return [150, 100, 0]
          case 5:
            return [150, 0, 0]
        }
      }
    }
  }
}