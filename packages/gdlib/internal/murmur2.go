package internal

import "os"

func ComputeMurmur2(filePath string) (uint32, error) {
	fd, err := os.Open(filePath)
	if err != nil {
		return 0, err
	}
	defer fd.Close()
	stat, err := fd.Stat()
	if err != nil {
		return 0, err
	}
	buffer := make([]byte, stat.Size())
	_, err = fd.Read(buffer)
	if err != nil {
		return 0, err
	}

	res := buffer[:0]
	for _, v := range buffer {
		if v != 9 && v != 10 && v != 13 && v != 32 {
			res = append(res, v)
		}
	}

	return murmurHash2(res), nil
}

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

func murmurHash2(data []byte) (h uint32) {
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
