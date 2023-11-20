

// 기능 버튼 액션 정의
$('.subject').click(function() {
    const subject = $(this).attr('subject');
    $('.line-svg').remove();

    $('#table-group').empty();
    if (subject === 'math') {
        subject_name = "math"
        dataset = dataset_math;
    } else if (subject === 'english') {
        subject_name = "english"
        dataset = dataset_english;
    } else if (subject === 'information') {
        subject_name = "information"
        dataset = dataset_information;
    }
    addRowsToTable('#table-group', dataset, true);
    addtionalInfo()
});

$('#reverse-button').click(function() {
    $('#reset-button').click();
    $('#table-group').empty();
    addRowsToTable('#table-group', dataset, true);
});
$('#minimum-button').click(function() {
    $('.cell_number').toggle();
    $('.cell_info').toggle();
    $('.cell').toggleClass('small');
    $('.cell_name').toggleClass('small');
    let tableWidth
    if ($('html').css('--table_width') == '220px') {
        tableWidth = '140px';
    } else {
        tableWidth = '220px';
    }
    $('html').css('--table_width', tableWidth);
    $('.cell_number').each(function() {
        const parent = $(this).parent();
        if (parent.css('background-color') === $(this).css('background-color')) {
            parent.css('background-color', '');
        } else {
            parent.css('background-color', $(this).css('background-color'));
        }
        
    });
});
$('#minimum-width-button').click(function() {
    $('.cell_number').toggle();
    $('.cell_info_left').toggle();
    $('.cell_name').toggleClass('small');
    $('.cell_info_right').toggleClass('small');
    let tableWidth
    if ($('html').css('--table_width') == '220px') {
        tableWidth = '140px';
    } else {
        tableWidth = '220px';
    }
    $('html').css('--table_width', tableWidth);
});
$('#reset-button').click(function() {
    $('.line-svg').remove();
    $('.findRelated, .selected, .s_pre, .s_follow').removeClass('findRelated selected s_pre s_follow');
})

// 단축키 정의
$(document).on('keydown', function(event) {
    $(document).on('keydown', function(event) {
        if (event.key === 'q' || event.key === 'ㅂ') {
            $('#reverse-button').click();
        }
    });
});

$(document).on('keydown', function(event) {
    if (event.key === 'e' || event.key === 'ㄷ') {
        $('#minimum-button').click();
    }
});
$(document).on('keydown', function(event) {
    if (event.key === 'r' || event.key === 'ㄱ') {
        $('#reset-button').click();
    }
});
$(document).on('keydown', function(event) {
    if (event.key === 'c' || event.key === 'ㅊ' || event.key === 'Escape') {
        $('.modal-close').click();
    }
});


// 연결 선 그리기 액션 정의
function drawRelated(a,page) {
    const cell = a.closest('.cell');
    const target = a.attr('relatedcode');
    const direction = a.attr('direction');
    dr(cell, target, direction,page);
}

// 선후학습 개별 클릭 시 액션 제어
$(document).on('click', '.popup_bullet', function(event) {
    event.stopPropagation();

    if ($(this).parents('.modal-content').length === 0) {
        const target = $(this).attr('relatedcode');
        const targetDiv = $(`div[cell_code="${target}"]`);
        const targetDirection = $(this).attr('direction');
        if (event.metaKey || event.ctrlKey) {
            targetDiv.find(`.popup_bullet[direction="${targetDirection}"]`).click();
        } 
        const targetOffset = targetDiv.offset().left;
        const targetWidth = targetDiv.outerWidth();
        const targetHeight = targetDiv.outerHeight();
        const targetCenterX = targetOffset + (targetWidth / 2);
        const targetCenterY = targetDiv.offset().top + (targetHeight / 2);
        const windowWidth = $(window).width();
        const windowHeight = $(window).height();
        const scrollPositionX = targetCenterX - (windowWidth / 2);
        const scrollPositionY = targetCenterY - (windowHeight / 2);
        $('html, body').animate({
            scrollLeft: scrollPositionX,
            scrollTop: scrollPositionY
        }, 500);
        
        drawRelated($(this));
    }
})


// 전체 연결 액션 정의
$(document).on('click', '.connect_all', function(event) {
    event.stopPropagation();
    $(this).parent().find('.popup_bullet').each(function() {
        drawRelated($(this));
    })
})

// 전체 연결 액션 정의
$(document).on('click', '.lv .all', function() {
    $(this).parent().parent().siblings().find('.popup_bullet').each(function() {
        drawRelated($(this));
    })
})
