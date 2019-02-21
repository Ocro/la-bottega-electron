import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ElectronService } from '../../providers/electron.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private ref: ChangeDetectorRef,
              private electron: ElectronService) { }

  ngOnInit() {
    const ipc = this.electron.ipcRenderer;
    let me = this;
    ipc.send('databaseSelectQuery')
    ipc.on('databaseSelectQueryResults', function (evt, results) {
      console.log(results.length)
      for (var i = 0; i < results.length; i++) {
        console.log(results[i])
      }
      // Really useful?
      // me.ref.detectChanges()
    });
  }
}
