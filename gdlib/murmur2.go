package gdlib

const (
	M     = 0x5bd1e995
	BIG_M = 0xc6a4a7935bd1e995
	R     = 24
	BIG_R = 47
)

func mmix(h uint32, k uint32) (uint32, uint32) {
	k *= M
	k ^= k >> R
	k *= M
	h *= M
	h ^= k
	return h, k
}

func MurmurHash2(data []byte) (h uint32) {
	var k uint32
	h = 1 ^ uint32(len(data))
	for l := len(data); l >= 4; l -= 4 {
		k = uint32(data[0]) | uint32(data[1])<<8 | uint32(data[2])<<16 | uint32(data[3])<<24
		h, k = mmix(h, k)
		data = data[4:]
	}

	switch len(data) {
	case 3:
		h ^= uint32(data[2]) << 16
		fallthrough
	case 2:
		h ^= uint32(data[1]) << 8
		fallthrough
	case 1:
		h ^= uint32(data[0])
		h *= M
	}

	h ^= h >> 13
	h *= M
	h ^= h >> 15

	return
}
