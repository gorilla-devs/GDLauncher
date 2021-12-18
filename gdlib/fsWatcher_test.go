package gdlib

import (
	"os"
	"testing"
	"time"
)

func TestStartFSWatcher(t *testing.T) {
	done := make(chan error)
	events := make(chan FSEvent)
	updateFunc := func(event FSEvent) {
		events <- event
	}

	go StartFSWatcher("./test_dir/test1", updateFunc, done)

	select {
	case err := <-done:
		if err != nil {
			t.Error(err)
		}
	case <-time.After(time.Second):
		t.Fatal("Timeout")
	}

	// Testing same directory again. Should fail because it's already being watched
	go StartFSWatcher("./test_dir/test1", updateFunc, done)

	select {
	case err := <-done:
		if err == nil {
			t.Error(err)
		}
	case <-time.After(time.Second):
		t.Fatal("Timeout")
	}

	// Test file creation
	go func() {
		time.Sleep(time.Second)
		os.WriteFile("./test_dir/test1/mock_file_temp", []byte(""), 0644)
	}()

	select {
	case event := <-events:
		if event.Path != "mock_file_temp" {
			t.Error("Wrong file name")
		} else if event.Type != FS_CREATE {
			t.Error("Wrong event type")
		}
	case <-time.After(2 * time.Second):
		t.Fatal("Timeout")
	}

	// Test file rename
	go func() {
		time.Sleep(time.Second)
		os.Rename("./test_dir/test1/mock_file_temp", "./test_dir/mock_file_temp2")
	}()

	select {
	case event := <-events:
		if event.Path != "mock_file_temp2" {
			t.Error("Wrong file name")
		} else if event.Type != FS_RENAME {
			t.Error("Wrong event type")
		}
	case <-time.After(2 * time.Second):
		t.Fatal("Timeout")
	}

	// Test file deletion
	go func() {
		time.Sleep(time.Second)
		os.Remove("./test_dir/test1/mock_file_temp2")
	}()

	select {
	case event := <-events:
		if event.Path != "mock_file_temp2" {
			t.Error("Wrong file name")
		} else if event.Type != FS_DELETE {
			t.Error("Wrong event type")
		}
	case <-time.After(2 * time.Second):
		t.Fatal("Timeout")
	}

}
