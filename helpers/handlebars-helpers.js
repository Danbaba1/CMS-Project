import moment from 'moment';

export function select(selected, options){
    return options.fn(this).replace(new RegExp(' value=\"'+ selected + '\"'), '$&selected="selected"');
}

export function paginate(options) {
    const { current } = options.hash;
    const isFirstPage = current === 1;
    let output = `
        <li class="page-item ${isFirstPage ? 'disabled' : ''}">
            <a href="?page=${isFirstPage ? 1 : '1'}" class="page-link">First</a>
        </li>
    `;
    let i = (Number(options.hash.current) > 5 ? Number(options.hash.current) - 4 : 1);

    if(i !== 1){
        output += `<li class="page-item disabled"><a class="page-link">...</a></li>`;
    }

    for(; i <= (Number(options.hash.current) + 4) && i <= options.hash.pages; i++){

        if(i === options.hash.current){
            output += `<li class="page-item active"><a class="page-link">${i}</a></li>`;
        } else {
            output += `<li class="page-item "><a href="?page=${i}" class="page-link">${i}</a></li>`;
        }

        if(i === Number(options.hash.current) + 4 && i < options.hash.pages){
            output += `<li class="page-item disabled"><a class="page-link">...</a></li>`;
        }
    }
    if(options.hash.current === options.hash.pages){
        output += `<li class="page-item disabled"><a class="page-link">Last</a></li>`;
    } else {
        output += `<li class="page-item "><a href="?page=${options.hash.pages}" class="page-link">Last</a></li>`;
    }
    return output;
}


export function generateDate(date, format){

    return moment(date).format(format);

}