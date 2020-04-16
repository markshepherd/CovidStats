import React from 'react';

export default class GestureHandler extends React.Component {
    constructor(props) {
        super(props);
        this.enable(this.props.enabled);
    }
    // adapted from https://stackoverflow.com/questions/2264072/
    // detect-a-finger-swipe-through-javascript-on-the-iphone-and-android
    enabled = false;

    enable(enabled) {
        if (this.enabled === enabled) return;

        if (enabled) {
            window.addEventListener('touchstart', this.handleTouchStart, false);        
            window.addEventListener('touchmove', this.handleTouchMove, false);
        } else {
            window.removeEventListener('touchstart', this.handleTouchStart, false);        
            window.removeEventListener('touchmove', this.handleTouchMove, false);
        }
        this.enabled = enabled;
    }

    xDown = null;                                                        
    yDown = null;

    getTouches = (evt) => {
      return evt.touches ||             // browser API
             evt.originalEvent.touches; // jQuery
    }                                                     

    handleTouchStart = (evt) => {
        const firstTouch = this.getTouches(evt)[0];                                      
        this.xDown = firstTouch.clientX;                                      
        this.yDown = firstTouch.clientY;                                      
    };                                                

    handleTouchMove = (evt) => {
        if (!this.xDown || !this.yDown) {
            return;
        }

        var xUp = evt.touches[0].clientX;                                    
        var yUp = evt.touches[0].clientY;

        var xDiff = this.xDown - xUp;
        var yDiff = this.yDown - yUp;

        if ( Math.abs(xDiff) > Math.abs(yDiff)) {/*most significant*/
            if (xDiff > 0) {
                this.props.onSwipeLeft && this.props.onSwipeLeft();
            } else {
                this.props.onSwipeRight && this.props.onSwipeRight();
            }                       
        } else {
            if (yDiff > 0) {
                this.props.onSwipeUp && this.props.onSwipeUp();
            } else { 
                this.props.onSwipeDown && this.props.onSwipeDown();
            }                                                                 
        }

        this.xDown = null;
        this.yDown = null;                                             
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.enable(this.props.enabled);
    }

    render() {
        return <div/>
    }
}
