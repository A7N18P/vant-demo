async function request(url: string) {
    const response = await fetch(url);
    return response.json();
}

function getCategoryList() {
    return request('/api/category/list')
}

function getCategoryFolder() {
    return request('/api/category/folder')
}

function getCategoryDetail(id: number) {
    return request(`/api/category/detail?id=${id}`)
}

function getFolderList(id: number) {
    return request(`/api/folder/list?id=${id}`)
}

export { getCategoryList, getCategoryFolder, getCategoryDetail, getFolderList }
