class ItemStack{
  item = "nothing";
  count = 1;
  getItem(){
    return Registry.items.get(this.item)
  }
}