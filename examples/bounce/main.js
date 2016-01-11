import 'babel-polyfill'; // needed for generators
import { build, runEvent, newSource } from '../../src/source';
import { fromDomEvent, animationFrames } from '../../src/dom';
import { map, merge, filter, scan, rest, sample } from '../../src/event';
import { constant, liftA2, newSignal, step, map as mapSignal } from '../../src/signal';
import integrate from '../../src/integrate';
import { newClock } from '../../src/clock';

const maxSpeed = 2.0; // pixels/ms

const friction = 0.001; // air resistance. 0.0 = no friction
const fk = 1.0 - friction;

const bounce = 0.99; // wall/ball energy transfer. 1.0 = perfect energy transfer

const getBounds = () => {
    const w2 = Math.floor(window.innerWidth / 2);
    const h2 = Math.floor(window.innerHeight / 2);

    return { x1: -w2, x2: w2, y1: -h2, y2: h2 }
};

const createDot = (parent) => {
    const dot = document.createElement('div');
    dot.className = 'dot';
    dot.textContent = '•';
    dot.style.fontSize = 50.0 + (Math.random()*200.0) + '%';
    dot.style.color = randomColor();
    parent.appendChild(dot);
    return dot;
};

// Generate a random color
const randomColor = () =>
    `hsl(${randInt(0, 360)},${randInt(20, 80)}%,${randInt(20, 80)}%)`;

// Generate a random int between low and high
const randInt = (low, high) =>
    Math.floor(Math.random() * (high - low)) + low;

const createDots = (parent, n) => {
    const dots = new Array(n);
    for(let i=0; i<n; ++i) {
        dots[i] = createDot(parent);
    }
    return dots;
};

const sign = () => Math.random() >= 0.5 ? 1 : -1;

const randomVelocity = () => ({
    x: Math.random() * maxSpeed,
    y: Math.random() * maxSpeed
});
const randomDotState = () => ({ x: 0, y: 0, xd: sign(), yd: sign() });

const moveDots = (dots, { bounds, velocity }, dt) =>
    dots.map((dot, i) => moveDot(dot, bounds, velocity[i], dt));

const moveDot = (dot, { x1, x2, y1, y2 }, vel, dt) => {
    let xd;
    let x;
    if(dot.x < x1) {
        x = x1;
        xd = -dot.xd*bounce;
    } else if(dot.x > x2) {
        x = x2;
        xd = -dot.xd*bounce;
    } else {
        xd = dot.xd*fk;
        x = dot.x + (xd * dt * vel.x);
    }

    let yd;
    let y;
    if(dot.y < y1) {
        y = y1;
        yd = -dot.yd*bounce;
    } else if(dot.y > y2) {
        y = y2;
        yd = -dot.yd*bounce;
    } else {
        yd = dot.yd*fk;
        y = dot.y + (yd * dt * vel.y);
    }

    return { x, y, xd, yd };
};

const updateDots = ({ dots, pos }) => {
    for(let i=0; i<dots.length; ++i) {
        dots[i].style.transform = `translate3d(${pos[i].x}px,${pos[i].y}px,0)`;
    }
};

const dots = build(function*() {
    const initBounds = getBounds();
    const dots = createDots(document.body, 200);
    const position = dots.map(randomDotState);

    const resize = yield fromDomEvent('resize', window);
    const bounds = mapSignal(getBounds, step(initBounds, resize));

    const velocity = constant(dots.map(randomVelocity));
    const state = liftA2((bounds, velocity) => ({ bounds, velocity }), bounds, velocity);

    const pos = integrate(moveDots, position, state);
    const world = liftA2((dots, pos) => ({ dots, pos }), constant(dots), pos);

    const rate = yield animationFrames();
    return sample(world, rate);
});

runEvent(updateDots, dots, newClock(Date.now));