const ipc = require('electron').ipcRenderer;
const remote = require('@electron/remote');
const win = remote.getCurrentWindow();
const fs = require('fs-extra');
const $ = require('jquery');
const Swal = require('sweetalert2');

// Page Change Listener & Function
$(document).on('click', '[data-target]', async function() {

    // Get requested page ID to load
    const target = $(this).data('target');
    
    // Deselect all sidebar entries & select targeted entry only
    $('#sidebar > .inner > div').removeClass('selected');
    $(`#sidebar > .inner > div[data-target="${target}"]`).addClass('selected');

    // Hide all pages
    $('#main > .content').removeClass('selected');

    // Show target page
    // Quick & dirty page fade in. Saves us from importing an animation library.
    $(`#main > .content[data-page="${target}"]`).fadeIn(500);
    $(`#main > .content[data-page="${target}"]`).addClass('selected');
    $(`#main > .content[data-page="${target}"]`).attr('style', '');

    // If requested page is 'sysinfo', call loadSysInfo to start fetching hardware info
    if (target === 'sysinfo') loadSysInfo();

    // If requested page is 'install', call loadInstallOpts to check already-installed or conflicting software
    if (target === 'install') loadInstallOpts();
});

// When clicking a checkbox option, toggle its 'selected' class
$(document).on('click', '.option.is-check', function() {
    $(this).toggleClass('selected');
});

// When clicking a checkbox option on the 'install' page, update the #installSummary elem
$(document).on('click', '[data-page="install"] .option.is-check', function() {
    const selectedLength = $('[data-page="install"] .option.is-check.selected').length;
    $('#installSummary > div > span').text(`Ready to install ${selectedLength} apps`);
    selectedLength ? $('#installSummary').addClass('is-visible') : $('#installSummary').removeClass('is-visible');
});

// 'sysinfo' page load function
async function loadSysInfo() {

    $('#sysInfoLoading').removeClass('is-hidden');
    $('#sysInfoContent').addClass('is-hidden');

    await sleep(750);

    const info = require('systeminformation');

    const sysInfo = {};

    $('#sysInfoProgress').text('Getting BIOS Information...');
    sysInfo.bios = await info.bios();
    
    $('#sysInfoProgress').text('Getting Motherboard Information...');
    sysInfo.mobo = await info.baseboard();
    $('#sysInfoContent [data-spec="mobo"]').text(`${sysInfo.mobo.model} (BIOS Dated ${sysInfo.bios.releaseDate})`);
    
    $('#sysInfoProgress').text('Getting CPU Information...');
    sysInfo.cpu = await info.cpu();
    $('#sysInfoContent [data-spec="cpu"]').text(`${sysInfo.cpu.brand} (${sysInfo.cpu.physicalCores}C/${sysInfo.cpu.cores}T @ ${sysInfo.cpu.speed}GHz)`);

    $('#sysInfoProgress').text('Getting RAM Information...');
    const memInfo = await info.mem();
    const memLayout = await info.memLayout();
    sysInfo.ram = {
        ...memInfo,
        layout: memLayout,
        dimms: memLayout.length,
        speed: memLayout[0].clockSpeed,
        manufacturer: memLayout[0].manufacturer,
        model: memLayout[0].partNum,
        totalGB: Math.ceil(memInfo.total / 1073741824), // RAM total in bytes / (1024 * 1024 * 1024), rounded up to nearest integer. Should give us total RAM in GB.)
        dimmSizeGB: Math.ceil(memLayout[0].size / 1073741824)
    }
    $('#sysInfoContent [data-spec="ram"]').text(`${sysInfo.ram.manufacturer} ${sysInfo.ram.model} ${sysInfo.ram.totalGB}GB (${sysInfo.ram.dimms}x${sysInfo.ram.dimmSizeGB}GB @ ${sysInfo.ram.speed}MHz)`);

    $('#sysInfoProgress').text('Getting GPU Information...');
    const graphics = await info.graphics();
    sysInfo.gpu = graphics.controllers[0];
    sysInfo.displays = graphics.displays;
    $('#sysInfoContent [data-spec="gpu"]').text(`${sysInfo.gpu.name} (Driver ${sysInfo.gpu.driverVersion})`);
    $('#sysInfoContent [data-spec="display"]').text(`${sysInfo.displays.length} display(s) connected`);

    $('#sysInfoProgress').text('Getting OS Information...');
    sysInfo.os = await info.osInfo();
    $('#sysInfoContent [data-spec="os"]').text(`${sysInfo.os.distro} (Build ${sysInfo.os.release})`);

    $('#sysInfoProgress').text('Getting Disk Information...');
    sysInfo.disks = await info.diskLayout();
    let diskString = '';
    sysInfo.disks.forEach(disk => {diskString += `${disk.name} (${disk.interfaceType} ${disk.type})<br>`})
    $('#sysInfoContent [data-spec="disk"]').html(diskString);

    $('#sysInfoLoading').addClass('is-hidden');
    $('#sysInfoContent').removeClass('is-hidden');
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