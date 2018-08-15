// Portions Copyright The Regents of the University of California
/**
* A simple bitview for Array buffer.
* @author: Joy Ghosh.
* @version: 0.0.1
*/

var BitView = function(buffer, start){
	this.buffer = buffer;
	this.start = start;
	this.uint8 = new Uint8Array(this.buffer);
}

/**
* Returns the bit value at position 'index'.
*/
BitView.prototype.get = function(index){
	var value = this.uint8[this.start + (index >> 3)];
	var offset = index & 0x7;
	return ((value >> (7-offset)) & 1);
}

/**
* Sets the bit value at specified position 'index'.
*/
BitView.prototype.set = function(index){
	var offset = index & 0x7;
	this.uint8[this.start + (index >> 3)] |= (0x80 >> offset);
}

/**
* Clears the bit at position 'index'.
*/
BitView.prototype.clear = function(index){
	var offset = index & 0x7;
	this.uint8[this.start + (index >> 3)] &= ~(0x80 >> offset);
}

/**
* Returns the byte length of this array buffer.
*/
BitView.prototype.length = function(){
	return this.uint8.byteLength;
}

/**
* Returns the array buffer.
*/
BitView.prototype.view = function(){
	return this.uint8;
}

module.exports = BitView;
