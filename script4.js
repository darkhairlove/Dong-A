
// 팝업 만들기
$(document).on('click', '.cell', function() {
    if ($(this).parents('.modal-content').length === 0) {
        showModal($(this).prop('outerHTML'))
    }
})

function showModal(sourceObj){
    let modal = `
        <div class="modal">
            <div class="modal-content">
                <div class="center">${sourceObj}</div>
            </div>
        </div>
        <div class="modal-close"></div>
    `;

    
    $('body').css('overflow', 'hidden');
    $('body').append(modal);    

    function makeRelated_inPopup(a, dd) {

        let left = $('<div class="left"></div>');
        let right = $('<div class="right"></div>');

        a.find('.popup_bullet').each(function() {
            let code = $(this).attr('relatedcode');
            let direction = $(this).attr('direction');
            let target = $(`#table-group [cell_code="${code}"]`).clone();
            if ($(`.modal [cell_code="${code}"]`).length > 0) {
                return;
            }

            if (direction === 'pre' && (dd === 'pre' || dd === 'all')) {
                a.parent().before(left);
                left.append(target);
                makeRelated_inPopup(target, 'pre');
            } else if (direction === 'follow' && (dd === 'follow' || dd === 'all')) {
                a.parent().after(right);
                right.append(target);
                makeRelated_inPopup(target, 'follow');
            }
        });
    };

    makeRelated_inPopup($('.modal .cell'), 'all');
    
    $('.modal .cell').each(function() {
        const code = $(this).attr('cell_code');
        $(this).append(`<span class="level">${findLvName(code).lv1} > ${findLvName(code).lv2}</span>`);
    })
    

    let main_cell = $('.modal .center .cell')
    let main_cell_code = main_cell.attr('cell_code');

    let sub_match = true
    sub_dataset.forEach(function(sub_data) {
        let sub_code = sub_data.sub_code;
        if (sub_code.slice(0, -3) === main_cell_code) {
            // let sub_cell = $(`<div class="sub_cell" sub_cell_code="${sub_code}"><span class='code'>${sub_code.slice(0, -3)}<span class='code_c'>${sub_code.slice(-3)}</span></span><span class='desc'>${sub_data.desc.replace(/[.,]/g, '<span>/</span>')}</span></div>`);
            let sub_cell = $(`<div class="sub_cell" sub_cell_code="${sub_code}"><span class='code'>${sub_code.slice(0, -3)}<span class='code_c'>${sub_code.slice(-3)}</span></span><span class='desc'>${sub_data.desc}</span></div>`);
            if (sub_match) {
                main_cell.parent().append(`<div class='match'>소주제</div>`);
                sub_match = false
            }
            main_cell.parent().append(sub_cell);
            
        }
    });

    $('.modal .cell').find('.popup_bullet').each(function() {
        drawRelated($(this), 'popup'); 
    })
    
    $('.modal-close').click(function() {
        $('.modal').remove();
        $('.modal-close').remove();
        $('body').css('overflow', 'auto');
        $('.line-svg.popup_line').remove();
    });


    // $('.modal-content').append()

}
