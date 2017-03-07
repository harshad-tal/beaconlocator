var frozen_markers = [];
var current_marker;
var map = $("#map");
var dialog;

$(document).ready(function() {
    upload_image_to_ls();
    load_ls_region();

    $("#select").click(function(){
        $(this).css("color", "red");
        var ias = $('#map').imgAreaSelect({
        instance: true,
        autoHide: true,
        onSelectEnd: function(img, selection){
            $(".box")
                .css('top', selection.y1)
                .css('height', selection.height)
                .css('left', selection.x1)
                .css('width', selection.width)
                .show();
            write_local_storage(
            "region",
             {
                "top": selection.y1,
                "left": selection.x1,
                "height": selection.height,
                "width": selection.width
             });
             $("#select").css("color", "#337ab7");
        }
        });
    });

    load_db_beacons();
    load_ls_beacons();

    dialog = $("#dialog-form").dialog({
        autoOpen: false,
        height: 400,
        width: 350,
        modal: true,
        buttons: {
            "Create new beacon": function() {
                addBeacon();
                dialog.dialog("close");
            },
            Cancel: function() {
                dialog.dialog("close");
                $('.marker').hide();
            }
        },
        close: function() {},
        position: {
            my: "right 10",
            of: $('.marker')
        }
    });

    $('.box').click(fp_click_handler);
});


function addBeacon() {
    var csrftoken = getCookie('csrftoken');
    img = document.getElementById('map');
    width_ratio = img.naturalWidth / img.clientWidth;
    height_ratio = img.naturalHeight / img.clientHeight;

    add_to_local_storage({
        "beacon_id": $("#beacon_id").val(),
        "beacon_name": $("#beacon_name").val(),
        "x_position": parseInt($("#x_position").val() * width_ratio),
        "y_position": parseInt($("#y_position").val() * height_ratio)
    });
}

function add_to_local_storage(data){
    var beacons = [];

    if (data.beacon_id !== ''){
        if(localStorage.getItem('beacons') == null){
            beacons.push(data);
            write_local_storage('beacons', beacons);
        } else{
            beacons = read_local_storage('beacons');
            beacons.push(data);
            write_local_storage('beacons', beacons);
        }
        add_beacon_marker(data.beacon_id);
    } else {
        console.log('blank input');
    }
}

function read_local_storage(key){
    return JSON.parse(localStorage.getItem(key));
}

function write_local_storage(key, value){
    localStorage.setItem(key, JSON.stringify(value));
}

function delete_local_storage(key){
    localStorage.removeItem(key);
}

$('#bulk_save').submit(function (e){
    e.preventDefault();
    beacons = read_local_storage('beacons');
    var csrftoken = getCookie('csrftoken');
    $.ajax({
        url: "/app/bulk_create_beacons/",
        type: "POST",
        headers: {
        'Content-Type':'application/json',
        'X-CSRFToken': csrftoken
        },
        dataType: "json",
        data: JSON.stringify({
            "beacons": beacons
        }),
        success: function(resp) {
            console.log(resp);
            $("#result").text(resp.status);
            delete_local_storage('beacons');
        },
        error: function(xhr, errmsg, err) {
            console.log(xhr.status + ": " + xhr.responseText);
        }
    });
});

function load_ls_beacons(){
    beacons = read_local_storage('beacons');
    load_markers(beacons);
}

function load_ls_region(){
    region = read_local_storage("region");
    if(region){
        $(".box")
            .css('top', region.top)
            .css('height', region.height)
            .css('left', region.left)
            .css('width', region.width)
            .show();
    }
}

function load_markers(beacons){
    var markers = $("#markers");
    var marker = $(".marker");
    img = document.getElementById('map');
    width_ratio = img.naturalWidth / img.clientWidth;
    height_ratio = img.naturalHeight / img.clientHeight;
    if(beacons){
        for(i=0; i<beacons.length; ++i){
            new_marker = marker.clone();
            new_marker.attr("id", "marker-"+beacons[i].beacon_id);
            new_marker.attr("class", "frozen_marker");
            new_marker.attr(
            "style", "cursor:pointer;position: absolute; left: "+beacons[i].x_position/width_ratio+"px; top:" + beacons[i].y_position/height_ratio +"px"
            );
            markers.append(new_marker);
        }
    }
}

function load_db_beacons(){
    $.ajax({
        url: "/app/get_beacons/",
        type: "GET",
        dataType: "json",
        success: function(resp) {
            console.log(resp);
            load_markers(resp);
        },
        error: function(xhr, errmsg, err) {
            console.log(xhr.status + ": " + xhr.responseText);
        }
    });
}

function add_beacon_marker(beacon_id) {
    $("#beacon_id").val('');
    $("#beacon_name").val('');

    frozen_markers.push($('.marker'));
    new_marker = $(".marker").clone();
    $('.marker').attr("id", "marker-"+beacon_id);
    $('.marker').attr("class", "frozen_marker");
    $('.marker').attr("src", "/static/main/frozen-marker-icon.png")
    $("#markers").append(new_marker);
}

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function fp_click_handler(e){
    x = e.pageX - ( $(window).width() / 10 ) - 24;
    y = e.pageY - 48
    $('.marker').css('left', x).css('top', y).show();
    $("#x_position").val(x);
    $("#y_position").val(y);
    dialog.dialog("open");
}

function upload_image_to_ls(){
    var img = new Image();
    img.src = localStorage.floorplan;
    img.id = "map";
    img.height = $(window).height() * 0.8;
    img.width = $(window).width() * 0.8;

    $('.imagearea').html(img);
    $('.imagearea').append('<div class="box"></div>')

    $("body").on("change",".img_input",function(){
        var fileInput = $(this)[0];
        var file = fileInput.files[0];

        var reader = new FileReader();
        reader.onload = function(e) {
            var img = new Image();
            img.src = reader.result;
            img.id = "map";
            img.height = $(window).height() * 0.8;
            img.width = $(window).width() * 0.8;
            localStorage.floorplan = reader.result;

            $(".imagearea").html(img);
            $('#map').click(fp_click_handler);
        }
        reader.readAsDataURL(file);
    });
}

