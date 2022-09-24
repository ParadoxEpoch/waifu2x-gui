const ipc = require('electron').ipcRenderer;
const remote = require('@electron/remote');
const win = remote.getCurrentWindow();
const fs = require('fs-extra');
const $ = require('jquery');
const Swal = require('sweetalert2');

// When clicking a checkbox option, toggle its 'selected' class
$(document).on('click', '.option.is-check', function() {
    $(this).toggleClass('selected');
});

function parseParams() {

    const inputFile = $('#inputFile').val();
    const outputFile = $('#outputFile').val();
    const denoise = $('input[name=denoise]:checked').val();
    const upscale = $('input[name=upscale]:checked').val();
    const aiModel = $('#aiModel').find(":selected").val();
    const gpuId = $('#gpuId').find(":selected").val();
    const outputFormat = 'jpg';
    const ttaMode = $('#ttaMode').attr('checked') ? '-x' : '';

    let command = `waifu2x-ncnn-vulkan -i "${inputFile}" -o "${outputFile}" -f ${outputFormat} -n ${denoise} -s ${upscale} -m "${aiModel}" -g ${gpuId} ${ttaMode}`;
    $('#cmdPreview').text(command);
}

function aboutApp() {
    Swal.fire({
        //iconHtml: '<img src="icons/aeonlabs_brand.png">',
        title: '<img src="icons/aeonlabs_brand.png" width="128" style="margin:20px 0"><br>AeonLabs Setup',
        text: `AeonLabs Setup is a tool for AeonLabs branded PCs that allows you to quickly install popular software, book a service and view information about your machine.`,
        footer: 'AeonLabs, 2018-2022'
    })
}

// Asynchronous sleep function
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));