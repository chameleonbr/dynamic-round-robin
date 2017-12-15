'use strict';

class Peers {
    constructor() {
        this._peerMap = {}
        this._length = 0
    }
    size() {
        return this._length
    }
    add(peer) {
        if (!peer)
            return false

        var key = peer.server

        if (!(key in this._peerMap)) {
            this._length++
        }

        this._peerMap[key] = this._reset(peer)

        return key
    }
    remove(key) {
        if (typeof key === 'function') {
            this.each(function (peer) {
                if (key(peer) === true) {
                    this.remove(peer.server)
                }
            }, this)

            return
        }

        if (key in this._peerMap) {
            delete this._peerMap[key]
            this._length--
        }
    }
    each(fn, context) {
        for (var _key in this._peerMap) {
            fn.call(context, this._peerMap[_key])
        }
    }
    reset() {
        this.each(function (peer) {
            this._reset(peer)
        }, this)
    };

    _reset(peer) {
        if (peer instanceof Array) {
            peer.map(Peers._reset, Peers)
            return
        };

        peer.currentWeight = peer.weight
        peer.effectiveWeight = peer.weight

        return peer
    }
    
    get() {

        var bestPeer, peer, peerKey

        if (this._length === 0)
            return null

        if (this._length === 1) {
            for (peerKey in this._peerMap)
                break
            return this._peerMap[peerKey]
        }

        var totalEffectiveWeight = 0

        for (peerKey in this._peerMap) {
            peer = this._peerMap[peerKey]

            totalEffectiveWeight += peer.effectiveWeight
            peer.currentWeight += peer.effectiveWeight

            if (peer.effectiveWeight < peer.weight)
                peer.effectiveWeight++

            if (!bestPeer || bestPeer.currentWeight < peer.currentWeight)
                bestPeer = peer

        }
        console.log(totalEffectiveWeight)

        if (bestPeer)
            bestPeer.currentWeight -= totalEffectiveWeight

        return bestPeer
    }
}

module.exports = Peers