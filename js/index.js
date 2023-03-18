"use strict";
const vConsole = console; // Comment to debug. Be sure to uncomment the script DevOps tag in Index.html as well.
// const vConsole = DevOps; // Uncomment prior line and comment script tag in Index.html to optimize for memory and performance.
const mediaFolder = getMediaFolder();
function getMediaFolder() {
    const m = document.querySelector("#id_media_folder");
    if (m != undefined)
        return m.dataset.mediaFolder;
    else
        return "xmediax";
}
; // getMediaFolder
class CardTrack {
    constructor(card, trackNumber) {
        this.trackNumber = -1;
        this.category = "general";
        this.title = "title";
        this.src = "";
        this.controlPanel = {};
        this.timer = -1;
        try {
            this.trackNumber = trackNumber;
            this.track = card;
            this.audio = card.querySelector("audio");
            this.playButton = card.querySelector("[data-action-type='play']");
            this.playImage = this.playButton.querySelector("img");
            this.status1 = card.querySelector("[name='status1']");
            this.status2 = card.querySelector("[name='status2']");
            this.category = card.getAttribute("data-card-category");
            this.title = card.getAttribute("data-card-title");
            this.src = this.audio.src;
            this.playButton.addEventListener("click", (e) => { this.play(); });
            this.audio.volume = CardPlayer.currentVolume;
            const pl = () => { this.preLoad(); }, pe = (e) => { this.playEvent(e); };
            this.audio.addEventListener("loadeddata", (e) => { pl(); });
            this.audio.addEventListener("playing", (e) => { pe(e); });
            // Load Control Panel
            const cp = this.controlPanel;
            cp.control0 = card.querySelector("[name='control0']");
            cp.control1 = card.querySelector("[name='control1']");
            cp.control2 = card.querySelector("[name='control2']");
            cp.control3 = card.querySelector("[name='control3']");
            cp.control4 = card.querySelector("[name='control4']");
            cp.control5 = card.querySelector("[name='control5']");
        }
        catch (e) {
            vConsole.log("track.constructor  error: " + e.message);
        }
        ; // catch
    }
    ; // constructor
    timeUpdate() {
        if (this.isPlaying()) {
            if (this.timer > -1)
                this.timeStatus();
            this.timer = setTimeout(() => { this.timeUpdate(); }, 1000);
        }
        else
            this.timer = -1;
    }
    ; // timeUpdate
    playEvent(e) {
        var _a;
        try {
            const src = ((_a = this.playImage) === null || _a === void 0 ? void 0 : _a.src) ? this.playImage.src : "";
            if (this.playImage) {
                this.playImage.src = src.replace("play", "pause");
                this.playImage.alt = "pause";
            }
            ;
            let cp = "";
            if (!CardPlayer.switchingTrack) {
                if (CardPlayer.lastTrack != this.trackNumber) {
                    cp = "Playing: " + this.title;
                    const handler = () => { this.setActive(true); };
                    setTimeout(handler, 200);
                }
                ;
                CardPlayer.statusMessage(cp, this.timeStatus());
                CardPlayer.lastTrack = this.trackNumber;
                this.timeUpdate();
            }
            else
                CardPlayer.switchingTrack = false;
        }
        catch (err) {
            vConsole.log('cardTrack.playEvent error: ' + err.message);
        }
        ; // catch
    }
    ; // playEvent      
    async setActive(active) {
        var _a, _b, _c, _d, _e;
        try {
            if (active) {
                const nc = CardPlayer.getNavControls();
                if (nc) {
                    const cp = this.controlPanel;
                    (_a = cp.control0) === null || _a === void 0 ? void 0 : _a.appendChild(nc.jumpBack);
                    (_b = cp.control2) === null || _b === void 0 ? void 0 : _b.appendChild(nc.jumpFoward);
                    (_c = cp.control3) === null || _c === void 0 ? void 0 : _c.appendChild(nc.prevTrack);
                    (_d = cp.control5) === null || _d === void 0 ? void 0 : _d.appendChild(nc.nextTrack);
                }
                ;
                const nb = CardPlayer.getNavBar();
                const tr = this.track;
                if ((nb) && (tr)) {
                    const pn = nb.parentNode;
                    const fc = (_e = this.track) === null || _e === void 0 ? void 0 : _e.firstChild;
                    if (fc)
                        tr.insertBefore(nb, fc);
                }
                ;
            }
        }
        catch (err) {
            vConsole.log("CardTrack.setActive error: " + err.message);
        }
    }
    preLoad() {
        try {
            if (this.status2)
                this.status2.innerText = "ready.";
            this.timeStatus();
        }
        catch (e) {
            vConsole.log("cardTrack.preLoad error: " + e.message);
        } //catch
    }
    play(doPlay = false) {
        try {
            if (this.playButton) {
                this.playButton.focus();
            }
            if (!CardPlayer.isCurrentTrack(this.trackNumber)) {
                CardPlayer.playTrack(this.trackNumber);
            }
            else {
                if (this.audio) {
                    if (!this.isPlaying()) {
                        this.audio.play();
                    }
                    else {
                        this.pause();
                    }
                }
                ;
            }
        }
        catch (e) {
            vConsole.log("track.play error: " + e.message);
        } // catch
    } // play
    async pause() {
        var _a, _b;
        try {
            const src = ((_a = this.playImage) === null || _a === void 0 ? void 0 : _a.src) ? this.playImage.src : "";
            if (this.playImage) {
                this.playImage.src = src.replace("pause", "play");
                this.playImage.alt = "Play " + this.title;
            }
            ;
            if (this.audio) {
                this.timeStatus();
                if (this.audio.paused) {
                    vConsole.log("Already Paused crazy fool.... " + this.src);
                }
                else {
                    (_b = this.audio) === null || _b === void 0 ? void 0 : _b.pause();
                }
            }
            ;
        }
        catch (err) {
            vConsole.log('cardTrack.pause error: ' + err.message);
        }
        ; // catch
    }
    ; // pause
    duration() {
        if (this.audio)
            return this.audio.duration;
        else
            return 0;
    }
    position(newPosition = -1) {
        if (this.audio) {
            if (newPosition != -1) {
                this.audio.currentTime = Math.min(newPosition, this.duration());
                this.timeStatus();
            }
            CardPlayer.statusMessage("", this.timeStatus());
            return this.audio.currentTime;
        }
        else
            return -1;
    }
    ; //position
    isPlaying() {
        const p = (this.audio) ? (!this.audio.paused) : false;
        return p;
    }
    ; // isPlaying
    mute() {
        try {
            if (this.audio) {
                this.audio.muted = !this.audio.muted;
            }
        }
        catch (err) {
            vConsole.log('cardTrack.mute error: ' + err.message);
        }
        ; // catch
    }
    ; // mute
    playbackRate(newRate = -1) {
        try {
            if (this.audio) {
                if ((newRate > 0.3) && (newRate <= 2.5))
                    this.audio.playbackRate = newRate;
                return this.audio.playbackRate;
            }
            else
                return 1;
        }
        catch (e) {
            vConsole.log("cadTrack.playbackRate error: (" + newRate + ")" + e.mesage);
            return -1;
        }
        ; //catch
    }
    ; // playbackRate
    setVolume() {
        try {
            if (this.audio) {
                this.audio.volume = CardPlayer.currentVolume;
            }
        }
        catch (err) {
            vConsole.log('cardTrack.setVolume error: ' + err.message);
            return 1;
        }
        ; // catch
    }
    ; // setVolume
    timeStatus() {
        try {
            const tSay = (m, s) => {
                let d = "";
                if (m > 0)
                    d = m + " minutes ";
                if ((m > 0) && (s > 0))
                    d += "and ";
                if (s > 0)
                    d += s + " seconds";
                return d;
            }; // tSay
            if (this.audio) {
                const ct = Math.floor(this.audio.currentTime), tt = Math.floor(this.audio.duration);
                // time description and time screen reader description
                let td = "unknown", ts = "";
                if (tt > 0) {
                    let m = Math.floor(tt / 60);
                    let s = tt - (m * 60);
                    td = m + ":" + s.toString().padStart(2, "0");
                    ts = tSay(m, s);
                    if (ct > 0) {
                        td = " of " + td;
                        ts = " of " + ts;
                        m = Math.floor(ct / 60);
                        s = ct - (m * 60);
                        td = m + ":" + s.toString().padStart(2, "0") + td;
                        ts = tSay(m, s) + ts;
                    }
                    ; // ct > 0
                }
                ; // if tt > 0
                if (this.status1)
                    this.status1.innerText = td;
                return ts;
            }
            else {
                if (this.status1)
                    this.status1.innerText = "unknown";
                return "";
            }
            ;
        }
        catch (e) {
            vConsole.log("cardTrack.timeStatus error: " + e.mesage);
            return "";
        }
        ; // catch
    }
    ; // timeStatus
    currentStatus() {
        try {
            let cp = "";
            if (this.isPlaying())
                cp = "playing: " + this.title;
            else
                cp = this.title + " is paused";
            CardPlayer.statusMessage(cp, this.timeStatus());
        }
        catch (err) {
            vConsole.log('cardTrack.currentStatus error: ' + err.message);
        }
        ; // catch
    }
    ; // currentStatus   
}
; // class cardTrack
class CardPlayer {
    constructor() {
        vConsole.log("You cannot create and instance of CardPlayer.");
    }
    ; // constructor
    static initialize() {
        const iv = document.getElementById("initialVolume");
        if (iv)
            CardPlayer.currentVolume = parseFloat(iv.innerText);
        const newTracks = [];
        const els = document.querySelectorAll("[name='track']");
        if (els) {
            for (let i = 0; i < els.length; i++) {
                const eT = els[i];
                const t = new CardTrack(eT, newTracks.length);
                newTracks.push(t);
            }
            ; //for
            CardPlayer.tracks = newTracks;
        }
        ; // if el
        window.addEventListener("keyup", (e) => { CardPlayer.keyHandler(e); });
        if (CardPlayer.mainContent) {
            const hExit = document.getElementById("exitHelpScreen");
            const hClose = document.getElementById("closeHelpScreen");
            if (hExit)
                hExit.onclick = () => { CardPlayer.hideHelpScreen(); };
            if (hClose)
                hClose.onclick = () => { CardPlayer.hideHelpScreen(); };
        }
        const hb = document.getElementById("helpButton");
        if (hb)
            hb.onclick = () => { CardPlayer.displayHelpScreen(); };
    }
    ; //Initialize
    static keyHandler(ev) {
        try {
            if (CardPlayer.helpStatus === "visible") {
                if (ev.key === "Escape") {
                    const hl = document.getElementById("helpLive");
                    if (hl)
                        hl.innerText = "Closing Help Screen. You may want to turn off screen navigation keys for optimal experience.";
                    setTimeout(() => { CardPlayer.hideHelpScreen(); }, 200);
                }
                else
                    vConsole.log("The key pressed was: " + ev.key);
            }
            else {
                if (!(ev.altKey || ev.ctrlKey)) {
                    let keyHandled = true;
                    if (ev.shiftKey) {
                        switch (ev.key) {
                            case "V":
                                CardPlayer.volume("down");
                                break;
                            case "N":
                                CardPlayer.switchTrack("next");
                                break;
                            case "P":
                                CardPlayer.switchTrack("prev");
                                break;
                            case ">":
                                CardPlayer.rate("faster");
                                break;
                            case "<":
                                CardPlayer.rate("slower");
                                break;
                            case "?":
                                CardPlayer.playerInfo.innerText = "Showing Help Screen. Screen Readers turn on navigation keys to read.";
                                setTimeout(() => { CardPlayer.displayHelpScreen(); }, 200);
                                break;
                            default:
                                vConsole.log("Key pressed: " + ev.key);
                                keyHandled = false;
                        }
                    }
                    else {
                        switch (ev.key) {
                            case "k":
                                CardPlayer.play();
                                break;
                            case "l":
                                CardPlayer.jump("f");
                                break;
                            case "j":
                                CardPlayer.jump("b");
                                break;
                            case "m":
                                CardPlayer.mute();
                                break;
                            case "v":
                                CardPlayer.volume("up");
                                break;
                            case "s":
                                CardPlayer.speakStatus();
                                break;
                            default:
                                const ix = '0123456789"'.indexOf(ev.key);
                                if (ix > -1)
                                    CardPlayer.moveTo(ev.key);
                                else
                                    keyHandled = false;
                        }
                        ; // switch
                    }
                    ; // if shiftkey
                    if (keyHandled)
                        ev.preventDefault();
                }
                ; // ef  ctrl, alt
            }
            ; // if (cardplayer.helpStatus)
        }
        catch (err) {
            vConsole.log("CardPlayer.keyHandle error: " + err.message);
        }
        ; //catch
    }
    ; // keyHandler
    static rate(newRate) {
        try {
            const card = CardPlayer.getTrack();
            let rate = card.playbackRate();
            rate += (newRate === "faster") ? 0.1 : -0.1;
            card.playbackRate(rate);
        }
        catch (err) {
            vConsole.log('CardPlayer.rate error: ' + err.message);
        }
        ; // catch
    }
    ; // rate
    static switchTrack(direction) {
        let nt = CardPlayer.currentTrack;
        if (direction === "next")
            nt++;
        else
            nt--;
        CardPlayer.switchingTrack = true;
        CardPlayer.playTrack(nt);
        const tu = () => { CardPlayer.timeUpdate(); };
        setTimeout(() => { tu(); }, 1100);
    }
    ; // switchTrack
    static volume(direction) {
        let newV = CardPlayer.currentVolume;
        ;
        if (direction === "down") {
            if (newV > 0.1)
                newV -= 0.1;
        }
        else if (newV < 0.9)
            newV += 0.1;
        CardPlayer.currentVolume = newV;
        CardPlayer.getTrack().setVolume();
    }
    ; // volume
    static mute() {
        CardPlayer.getTrack().mute();
    }
    ; // mute
    static jump(direction) {
        const card = CardPlayer.getTrack();
        let d = card.duration();
        if (!(d))
            d = 0;
        let ct = card.position();
        if (!(ct))
            ct = 0;
        ct += (direction === "b") ? -15 : 15;
        if (ct < 0)
            ct = 0;
        else if (ct > d)
            ct = d;
        card.position(ct);
    }
    ; //jump
    static moveTo(position) {
        try {
            const card = CardPlayer.getTrack();
            let newPosition = parseInt(position.trim().substr(0, 1), 10) / 10;
            newPosition *= card.duration();
            card.position(newPosition);
        }
        catch (e) {
            vConsole.log("CardPlayer.moveTo error: " + e.message);
        }
        ; // catch
    }
    ; // moveTo
    static isPlaying() {
        return CardPlayer.getTrack().isPlaying();
    } // isPlaying
    static async pause() {
        if (CardPlayer.isPlaying()) {
            CardPlayer.getTrack().pause();
        }
        ;
    }
    ;
    static play() {
        const card = CardPlayer.getTrack();
        if (card.isPlaying())
            card.pause();
        else
            card.play();
    }
    ; //play()
    static isCurrentTrack(trackNumber) {
        return (CardPlayer.currentTrack === trackNumber);
    }
    ; // isCurrentTrack
    static async playTrack(trackNumber) {
        try {
            const ct = CardPlayer.currentTrack;
            if (ct != trackNumber)
                await CardPlayer.pause();
            CardPlayer.currentTrack = trackNumber;
            const card = CardPlayer.getTrack();
            card.setVolume();
            await card.play(true);
            card.setActive(true);
        }
        catch (e) {
            vConsole.log("CardPlayer.playTrack error " + e.message);
        }
        ; // catch
    }
    ; // playTrack
    static getTrack(trackNumber = CardPlayer.currentTrack) {
        try {
            let ct = CardPlayer.currentTrack;
            if ((trackNumber > -1) && (trackNumber < CardPlayer.tracks.length))
                ct = trackNumber;
            if ((ct < 0) || (ct >= CardPlayer.tracks.length)) {
                ct = 0;
                CardPlayer.currentTrack = ct;
            }
            ;
        }
        catch (err) {
            vConsole.log('CardPlayer.getTrack error: ' + err.message);
        }
        ; // catch
        return CardPlayer.tracks[CardPlayer.currentTrack];
    }
    ; // getTrack
    static statusMessage(status, info) {
        try {
            if (status) {
                CardPlayer.playerStatus.innerText = status;
                CardPlayer.currentStatus.innerText = status;
            }
            if (info)
                CardPlayer.playerInfo.innerText = info;
            setTimeout(() => CardPlayer.clearStatus(), 1500);
        }
        catch (e) {
            vConsole.log("CardPlayer.statusMessage error: " + e.message);
        }
        ; // catch
    }
    ; // statusMessage
    static clearStatus() {
        try {
            CardPlayer.playerStatus.innerText = "";
            CardPlayer.playerInfo.innerText = "";
        }
        catch (err) {
            vConsole.log('CardPlayer.clearStatus error: ' + err.message);
        }
        ; // catch
    }
    ; // clearStatus
    static speakStatus() {
        try {
            CardPlayer.getTrack().currentStatus();
        }
        catch (err) {
            vConsole.log('CardPlayer.speakStatus error: ' + err.message);
        }
        ; // catch
    }
    ; // speakStatus
    static makeNavControls() {
        try {
            const makeImg = (image, altText) => {
                const i = document.createElement("img");
                i.setAttribute("alt", altText);
                i.setAttribute("class", "card-img");
                // i.setAttribute("width", "30px");
                i.setAttribute("height", "30px");
                i.setAttribute("src", ("images/" + image + ".svg").toLowerCase());
                return i;
            };
            const makeButton = (name, altText, handler) => {
                const b = document.createElement("button");
                b.setAttribute("class", "card-button mt-2");
                b.setAttribute("name", "name-button mt-2");
                b.onclick = () => { handler(); };
                b.appendChild(makeImg(name, altText));
                return b;
            };
            const nc = {
                jumpFoward: makeButton("foward", "foward 15 seconds (L)", () => { CardPlayer.jump("f"); }), jumpBack: makeButton("REWIND", "rewind15 seconds (J)", () => { CardPlayer.jump("b"); }),
                nextTrack: makeButton("next", "Next Track (shift + N)", () => { CardPlayer.switchTrack("next"); }), prevTrack: makeButton("PREVIOUS", "Previous Track (shift + P)", () => { CardPlayer.switchTrack("prev"); })
            };
            CardPlayer.navControls = nc;
        }
        catch (err) {
            vConsole.log('CardPlayer.getNavControls error: ' + err.message);
        }
        ; // catch
    }
    ; // makeNavControls
    static getNavControls() {
        if (!CardPlayer.navControls)
            CardPlayer.makeNavControls();
        return CardPlayer.navControls;
    }
    ; // getNavControls;
    static makeNavBar() {
        try {
            const nb = document.createElement("div");
            nb.setAttribute("class", "card-nav-bar");
            nb.setAttribute("name", "navBar");
            nb.setAttribute("title", "Navigation Bar");
            CardPlayer.navBar = nb;
            const makeImage = (index) => {
                const i = document.createElement("img");
                i.setAttribute("class", "card-nb-img");
                i.setAttribute("src", (`images/${index}.svg`).toLowerCase());
                const altText = (index <= 0) ? "Beginning (0)" : `${index}0%  (${index})`;
                i.setAttribute("alt", altText);
                return i;
            };
            const makeButton = (index) => {
                const b = document.createElement("button");
                b.setAttribute("class", "card-nb-button");
                const handler = () => { CardPlayer.moveTo(index.toString()); };
                b.onclick = handler;
                b.appendChild(makeImage(index));
                return b;
            };
            for (let i = 0; i < 10; i++) {
                nb.appendChild(makeButton(i));
            }
            ; // for
            const makeVolumeImage = (dir) => {
                const i = document.createElement("img");
                i.setAttribute("class", `card-nb-img volume-${dir}`);
                i.setAttribute("src", (`images/volume-${dir}.svg`).toLowerCase());
                const kText = (dir === "down") ? "(shift + v)" : "(v)";
                i.setAttribute("alt", `Volume ${dir} ${kText}`);
                return i;
            };
            const makeVolumeButton = (dir) => {
                const b = document.createElement("button");
                b.setAttribute("class", `card-nb-button volume-button`);
                const handler = () => { CardPlayer.volume(dir); };
                b.onclick = handler;
                b.appendChild(makeVolumeImage(dir));
                return b;
            };
            nb.appendChild(makeVolumeButton("down"));
            nb.appendChild(makeVolumeButton("up"));
        }
        catch (err) {
            vConsole.log('CardPlayer.makeNavBar error: ' + err.message);
        }
        ; // catch
    }
    ; // makeNavBar
    static getNavBar() {
        try {
            if (!CardPlayer.navBar)
                CardPlayer.makeNavBar();
            return CardPlayer.navBar;
        }
        catch (err) {
            vConsole.log("CardPlayer.getNavBar error: " + err.message);
        }
        ; // catch
        return CardPlayer.navBar;
    }
    ; // getNavBar
    static timeUpdate() {
        const tr = CardPlayer.getTrack();
        if (tr.timer < 0) {
            tr.timeUpdate();
        }
    }
    ; // timeUpdate
    static async displayHelpScreen() {
        CardPlayer.helpStatus = "visible";
        const mc = CardPlayer.mainContent;
        if (mc) {
            mc.setAttribute("aria-hidden", "true");
            mc.style.display = "none";
        }
        ;
        const h = window.screen.availHeight;
        if (CardPlayer.backDrop) {
            CardPlayer.backDrop.classList.remove("hide");
            CardPlayer.backDrop.classList.add("show");
            CardPlayer.backDrop.style.minHeight = `${h}px`;
        }
        ;
    }
    ; // displayHelpScreen
    static async hideHelpScreen() {
        CardPlayer.helpStatus = "hidden";
        const hl = document.getElementById("helpLive");
        if (hl)
            hl.innerText = "";
        const mc = CardPlayer.mainContent;
        if (mc) {
            mc.setAttribute("aria-hidden", "false");
            mc.style.display = "block";
        }
        ;
        if (CardPlayer.backDrop) {
            CardPlayer.backDrop.classList.add("hide");
            CardPlayer.backDrop.classList.remove("show");
        }
        ;
    }
    ; // hideHelpScreen;
}
CardPlayer.tracks = [];
CardPlayer.currentTrack = -1;
CardPlayer.lastTrack = -1;
CardPlayer.switchingTrack = false;
CardPlayer.currentVolume = 0.2;
CardPlayer.currentStatus = document.querySelector("#id_player_status_current");
CardPlayer.playerStatus = document.querySelector("#id_player_status");
CardPlayer.playerInfo = document.querySelector("#id_player_info");
CardPlayer.mainContent = document.getElementById("mainContent"); // Need to hide to show help screen
CardPlayer.backDrop = document.getElementById("dlgBack");
CardPlayer.helpStatus = "hidden";
(() => {
    CardPlayer.initialize();
})();
; // class cardPlayer
//# sourceMappingURL=index.js.map