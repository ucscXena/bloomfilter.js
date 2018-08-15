// Portions Copyright The Regents of the University of California
/**
* Bloom filter.
* @author: Joy Ghosh
* @version: 0.0.1
*/

var BitView = require('./bitview.js');
var fnv_1a = require('./fnv.js');
var one_at_a_time_hash = require('./jenkins.js');

//Constants.
const BITS_IN_BYTE = 8;
const HEADER_BYTES = 4 * 3; // m, k, size as 32 bit unsigned ints

function align4(n) {
	return Math.ceil(n / 4) * 4;
}

// offset must be 4-byte aligned
function fromArray(bloom, arr, offset) {
	var ia = new Uint32Array(arr),
		ioffset = offset / 4;
	// XXX Use DataView to avoid host byte order problems?
	bloom.m = ia[0 + ioffset];
	bloom.k = ia[1 + ioffset];
	bloom.size = ia[2 + ioffset];
	bloom.bufferSize = align4(bloom.size + HEADER_BYTES);

	bloom.bitview = new BitView(arr, offset + HEADER_BYTES);
}

function align4(n) {
	return Math.ceil(n / 4) * 4;
}

function fromParams(bloom, n, rate) {
	//Bits in Bloom filter.
	bloom.m = Math.ceil((-2)*n*Math.log(rate));
	//Number of hash functions.
	bloom.k = Math.ceil(0.7*(bloom.m/n));

	//Normalize size.
	bloom.size = Math.ceil(bloom.m/BITS_IN_BYTE);
	bloom.bufferSize = align4(bloom.size + HEADER_BYTES);

	//Initialize bit array for filter.
	bloom.bitview = new BitView(new ArrayBuffer(bloom.bufferSize), HEADER_BYTES);
	// XXX Use DataView to avoid host byte order problems?
	var ia = new Uint32Array(bloom.bitview.buffer);
	ia[0] = bloom.m;
	ia[1] = bloom.k;
	ia[2] = bloom.size;
}

/**
* Bloom filter object.
* n represents number of elements in this filter.
* rate is projected error rate for random inputs
*/
var BloomFilter = function(n, rate) {
	((n instanceof ArrayBuffer) ? fromArray : fromParams)(this, n, rate);
}

//Generate hash value.
BloomFilter.prototype.calculateHash = function(x,m,i){
	//Double hash technique.
	return ((fnv_1a(x) + (i*one_at_a_time_hash(x)))%m);
}

//Looks for membership.
BloomFilter.prototype.test = function(data){
	var hash = data;
	if (this.k === 0) {
		return false;
	}
	for(var i=0; i<this.k; i++){
		hash = this.calculateHash(hash, this.m, i);
		if(!this.bitview.get(hash)){
			return false;
		}
	}
	return true;
}

//Adds data to filter.
BloomFilter.prototype.add = function(data){

	var hash = data;
	for(var i=0; i<this.k; i++){
		hash = this.calculateHash(hash, this.m, i);
		this.bitview.set(hash);
	}
}

//Return the underlying buffer.
BloomFilter.prototype.buffer = function(){
	return {
		buffer: this.bitview.buffer,
		start: this.bitview.start - HEADER_BYTES,
		size: this.bufferSize
	};
}

module.exports = BloomFilter;
