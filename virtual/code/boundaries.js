export function clampPosition(position) {
    if (position.z > -10) {
        position.z = -10;
    } else if (position.z < -70) {
        position.z = -70;
    }

    if (position.x > 10) {
        position.x = 10;
    } else if (position.x < -10) {
        position.x = -10;
    }

    // Road outside college
    if (position.z <= -46) {
        if (position.z >= -47 && (position.x > 3.5 || position.x < -3.5 || (position.x < 1.5 && position.x > -1.5))) {
            position.z = -47;
        }
    }
    // Entrance road
    else if (position.z < -32 && position.z > -47) {
        if (position.x > 3.5) {
            position.x = 3.5;
        } else if (position.x < -3.5) {
            position.x = -3.5;
        } else if (position.x < 1 && position.x > -1) {
            position.x = position.x >= 0 ? 1 : -1;
        }
    }
    // Center road
    else if (position.z >= -32 && position.z < -27) {
        if (position.z <= -31.9 && (position.x > 3.5 || position.x < -3.5 || (position.x < 1.5 && position.x > -1.5))) {
            position.z = -31.9;
        } else if (position.z >= -27.7 && (position.x > 6.5 || position.x < -6.5 || (position.x < 4 && position.x > -4))) {
            position.z = -27.7;
        }
    }
    // Inner campus area
    else if (position.z >= -27 && position.z <= -12) {
        if (position.x > 6.4) {
            position.x = 6.4;
        } else if (position.x < -6.4) {
            position.x = -6.4;
        }
        if (position.z >= -13.6) {
            if (position.z < -13.5 && (position.x < 3.5 && position.x > -3.5)) {
                position.z = -13.5;
            }
        } else {
            if (position.z <= -26.5 && (position.x < 4 && position.x > -4)) {
                position.z = -26.5;
            } else if (position.z >= -24.7 && position.z <= -24.6 && (position.x < 3.5 && position.x > -3.5)) {
                position.z = -24.7;
            } else if (position.x < 3.5 && position.x > 0 && (position.z > -24.7 && position.z < -13.5)) {
                position.x = 3.5;
            } else if (position.x > -3.5 && position.x < 0 && (position.z > -24.7 && position.z < -13.5)) {
                position.x = -3.5;
            }
        }
    }
}
