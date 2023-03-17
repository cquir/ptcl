function argmin(vec:Array<number>){
    return vec.map((a,i) => [a,i]).sort((a,b) => a[0]-b[0]).map(a => a[1])[0]
}

export { argmin };