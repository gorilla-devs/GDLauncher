package gdlib

import (
	"testing"
)

func TestMurmur2(t *testing.T) {
	res, err := ComputeMurmur2("./test_dir/mock_file")
	if err != nil || res != 2800884615 {
		t.Error(err)
	}
}

func TestMurmur2NotFound(t *testing.T) {
	res, err := ComputeMurmur2("./file_not_found")
	if err == nil || res != 0 {
		t.Error(err)
	}
}
