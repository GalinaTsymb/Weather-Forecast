/**
 * dynamic create options in select
 * @param selector
 * @param elem
 */
export function create_option(selector, elem) {
    let x = document.getElementById(`${selector}`);
    let option = document.createElement("option");
    option.text = elem;
    x.add(option);
}