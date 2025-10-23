export const formattedCityList = (arr,text)=>{
    arr.forEach(item=>{
        item.text = item.name
        item.value = text ? `${text}-${item.text}` : item.text
        if(item.childs){
            item.children = item.childs
            delete item.childs
            formattedCityList(item.children,item.value)
        }
        
    })
}

