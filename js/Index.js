'use strict';

const requestURL = '../json/db.json';
const albums_container = document.getElementById("chart_container");
const audio_container = document.getElementById("audio_container");
const player_container = document.getElementById("player_container");
const disk_container = document.getElementById("disk_container");

var current_album_id;
var current_song_id;

let json;
let current_album;
let current_playlist;
let current_song;
let click = true;
let screen;
let screen_size;

const menu = document.getElementById("menu");
const play_pause = document.getElementById("play_pause");
const prev_song = document.getElementById("prev_song");
const next_song = document.getElementById("next_song");
const current_audio = document.getElementById("audio");
const menu_burger = document.getElementById("menu_burger")

let audio_img_src = document.getElementById("own_img_audio").src;
let progress_input = document.getElementById("progress_range_input");
let volume_input = document.getElementById("volume_range_input");

var play = false;
var count = 0;

if (matchMedia) {
    screen = window.matchMedia("screen and (max-width: 1000px)");
    screen.addListener(changes);
    changes(screen);
}

var get_json_data = function (url) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.onload = function () {
        if (xhr.status === 200 || xhr.status == 0) {
            json = JSON.parse(xhr.responseText);
        }
    }

    xhr.send();
}

function changes(screen) {
    if (screen.matches) {
        screen_size = 'small';
        menu.style.display = 'none';
    }
    else {
        screen_size = 'large';
        menu.style.display = 'grid';
        
    }
}

function create_html_element(containerElement, htmlTag, attributes, inner) {
    let newElement = document.createElement(htmlTag);
    attributes.forEach(function (entry) {
        newElement.setAttribute(entry[0], entry[1])
    });
    if (inner != undefined) {
        newElement.innerHTML = inner;
    }
    containerElement.append(newElement);
}

function load_albums() {
    let albums = json.Albums;
    document.getElementById("Count_Albums").innerHTML = albums.length + " Albums";
    for (let i = 0; i < albums.length; i++) {
        let singer = json.Singers.find(item => item.id == albums[i].singer_id);

        let album = document.createElement('li');
        album.setAttribute('album_id', albums[i].id);
        album.setAttribute('class', 'album');

        let album_img = document.createElement("div");
        album_img.setAttribute("class", "album_img");
        album.append(album_img);

        create_html_element(album_img, "img", [["src", albums[i].album_img], ["alt", "img_for_album_" + i]]);
        create_html_element(album, "span", [["class", "album_title"]], albums[i].album_name);
        create_html_element(album, "span", [["class", "album_singer"]], singer.singer_name);

        albums_container.append(album);
    }
}

function add_song_container(singer, album, song_number, song, ) {
    let song_container = document.createElement('li');
    song_container.setAttribute('song_id', song.id);
    song_container.setAttribute('class', 'song_container');

    create_html_element(song_container, "span", [["class", "song_number"]], song_number);
    let img_song = document.createElement("div");
    img_song.setAttribute("class", "img_song");
    song_container.append(img_song);
    create_html_element(img_song, "img", [["src", album.album_img], ["alt", "img_for_song_" + song_number]]);

    let animation = document.createElement("div");
    animation.setAttribute("id", "bars");
    song_container.append(animation);
    create_html_element(animation, "div", [["class", "bar"]]);
    create_html_element(animation, "div", [["class", "bar"]]);
    create_html_element(animation, "div", [["class", "bar"]]);
    create_html_element(animation, "div", [["class", "bar"]]);
    create_html_element(animation, "div", [["class", "bar"]]);
    create_html_element(animation, "div", [["class", "bar"]]);


    create_html_element(song_container, "span", [["class", "album_title"]], song.audio_name);
    create_html_element(song_container, "span", [["class", "album_singer"]], singer.singer_name);
    create_html_element(song_container, "span", [["class", "duration"]], song.duration);
    create_html_element(song_container, "input", [["type", "checkbox"], ["id", song.id], ["name", "song_like"]], song.like ? 'red' : 'black');
    create_html_element(song_container, "label", [["for", song.id], ["name", "song_like"], ["class", "icon-like"]]);

    audio_container.append(song_container);
}

function fill_playlist(with_album_id) {
    let count_song = 1;
    if (with_album_id) {
        let singer = json.Singers.find(item => item.id == current_album.singer_id);
        for (let i = 0; i < current_playlist.length; i++) {
            add_song_container(singer, current_album, count_song, current_playlist[i]);
            count_song++;
        }
    }
    else {
        for (let i = 0; i < current_playlist.length; i++) {
            let album = json.Albums.find(item => item.id == current_playlist[i].album_id);
            let singer = json.Singers.find(item => item.id == album.singer_id);
            add_song_container(singer, album, count_song, current_playlist[i]);
            count_song++;
        }
    }
}

function load_playlist(is_favorites) {
    audio_container.innerHTML = "";
    if (is_favorites) {
        document.getElementById("name_album").innerHTML = "Favorite songs";
        current_playlist = json.Songs.filter(item => item.like == true);
    }
    else {
        document.getElementById("name_album").innerHTML = current_album.album_name;
        current_playlist = json.Songs.filter(item => item.album_id == current_album_id);
    }

    document.getElementById("Count_Songs").innerHTML = current_playlist.length + " Songs";

    fill_playlist(!is_favorites);
}

function player_change_song() {
    let album = json.Albums.find(item => item.id == current_song.album_id);
    let singer = json.Singers.find(item => item.id == album.singer_id);

    let img = document.getElementById("own_img_audio");
    img.setAttribute("src", "");
    img.setAttribute("alt", "");
    img.setAttribute("src", album.album_img);
    img.setAttribute("alt", "own_img_audio" + current_song_id);

    let name_song = document.getElementById("album_title_current");
    name_song.innerHTML = "";
    name_song.innerHTML = current_song.audio_name;

    let name_singer = document.getElementById("album_singer_current");
    name_singer.innerHTML = "";
    name_singer.innerHTML = singer.singer_name;

    current_audio.setAttribute("src", current_song.audio_src);
}

albums_container.addEventListener('click', (event) => {
    if (event.target.closest('li')) {
        current_album_id = event.target.closest('li').getAttribute("album_id");
        current_album = json.Albums.find(item => item.id == current_album_id);
        load_playlist(false);
    }
})

function set_animation(container, value) {
    let bars = container.getElementsByClassName("bar");
    Array.from(bars).forEach(elem => elem.style.width = value + "px");
}

function find_container(value) {
    let containers = document.getElementsByClassName("song_container");
    let prev_container = Array.from(containers).find(item => item.getAttribute("song_id") == current_song_id);
    if (prev_container != undefined) {
        set_animation(prev_container, value);
    }
}

audio_container.addEventListener('click', (event) => {
    if (event.target.closest('li')) {

        let container = event.target.closest('li');
        let selected_id = container.getAttribute("song_id");
        current_song = json.Songs.find(item => item.id == selected_id);

        if (current_song_id != selected_id) {
            if (current_song_id != undefined) {
                find_container(0);
            }
            current_song_id = selected_id;
            set_animation(container, 3);
            player_change_song();
            play_method();
        }
        else if (play) {
            pause_method();
            set_animation(container, 0);
        }
        else {
            play_method();
            set_animation(container, 3);
        }
    }
})

function count_time_common(time) {
    let second;
    let minute;
    let hour = 0;
    second = (Math.ceil(time)) % 60;
    if (second < 10) {
        second = '0' + second;
    }
    else if (second >= 10 && second < 60) {
        second = second;
    }
    else if (second > 60) {
        second = 0;
    }
    minute = Math.floor(time / 60);
    if (minute < 10) {
        minute = '0' + minute;
        time = minute + ' : ' + second;
    }
    else if (minute >= 10 && minute < 60) {
        minute = minute;
        time = minute + ' : ' + second;
    }
    else if (minute > 60) {
        minute = 0;
        if (minute < 10) {
            minute = '0' + minute;
        }
        hour++;
        time = hour + ' : ' + minute + ' : ' + second;
    }
    return time;
}

play_pause.addEventListener("click", function () {

    if (play_pause.innerHTML == "►" && play == false) {

        if (current_song == undefined) {
            current_song = current_playlist[0];
            current_song_id = current_song.id;
            player_change_song();
            find_container(3);
        }
        play_method();
    }
    else {
        pause_method();
    }
});

prev_song.addEventListener("click", function () {
    let index = current_playlist.indexOf(current_song);
    if (index == 0) {
        stop_method();
    }
    else {
        find_container(0);
        play_next(index - 1);
        find_container(3);
    }
});

next_song.addEventListener("click", function () {
    let index = current_playlist.indexOf(current_song);
    if (index == current_playlist.length - 1) {
        stop_method();
    }
    else {
        find_container(0);
        play_next(index + 1);
        find_container(3);
    }
});

function play_method() {
    play_pause.innerHTML = "❚❚";
    current_audio.play();
    current_audio.addEventListener('error', function () {
        alert('ошибка загрузки файла');
    }, false);
    play = true;
    find_container(3);
}

function pause_method() {
    play_pause.innerHTML = "►";
    play = false;
    current_audio.pause();
    find_container(0);
}

function stop_method() {
    pause_method();
    current_audio.currentTime = 0;
}

function play_next(index) {
    current_song = current_playlist[index];
    current_song_id = current_song.id;
    player_change_song();
    play_method();
}

document.getElementById("button_volume").addEventListener('click', function () {
    if (click == true) {
        click = false; volume_input.style.display = 'block';
    }
    else {
        click = true;
        volume_input.style.display = 'none';
    }
}, false);

volume_input.addEventListener('input', function () {
    current_audio.volume = (volume_input.value) / 10;
    console.log(current_audio.volume)
}, false);

current_audio.onloadedmetadata = function () {
    document.getElementById("full_time_song").innerHTML = count_time_common(current_audio.duration);
    progress_input.setAttribute("max", Math.trunc(current_audio.duration));
}

current_audio.ontimeupdate = function () {
    let time = current_audio.currentTime;

    if (play == true) {
        if (time == current_audio.duration) {
            time = 0;
            current_audio.currentTime = 0;
            progress_input.value = 0;

            let index = current_playlist.indexOf(current_song);
            if (index == current_playlist.length - 1) {
                stop_method();
            }
            else {
                play_next(index + 1);
            }
        }
        else {
            progress_input.value = Math.trunc(time);
        }
    }
    time = count_time_common(time);
    document.getElementById("count_time").innerHTML = time;
}

progress_input.addEventListener('input', function () {
    current_audio.currentTime = progress_input.value;
}, false);

menu_burger.addEventListener("click", function () {
    if (screen_size == 'small') {
        if (click == true) {
            click = false;
            menu.style.display = 'block';
        }
        else if (click == false) {
            click = true;
            menu.style.display = 'none';
        }
    }
});


get_json_data(requestURL);

load_albums();

load_playlist(true);