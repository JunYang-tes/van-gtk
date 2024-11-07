import Gtk from 'gi://Gtk?version=4.0';
import GLib from 'gi://GLib?version=2.0';
import { app, Button, Box, Label, Entry, van, ListBoxRow, ListBox, ScrolledWindow, Revealer } from '../../src/'

const count = van.state(0)

app(
  () => {
    const input = van.state("")
    const expanded = van.state(false)
    const win = new Gtk.Window({
      child: Box(
        {
          orientation: Gtk.Orientation.VERTICAL,
          vexpand: true
        },
        Label({ label: () => `Input:${input.val}` }),
        Entry({
          text: input,
          onchanged: (i: Gtk.Entry) => {
            input.val = i.text
          }
        }),
        ScrolledWindow(
          {vexpand: true},
          ListBox(
            ListBoxRow(Label({ label: "Row1" })),
            ListBoxRow(Label({ label: "Row2" })),
            ListBoxRow(() => `Input length ${input.val.length}`),
            ListBoxRow(Box(
              { orientation: Gtk.Orientation.VERTICAL },
              Label({ label: "Row4" }),
              Button({ label: () => expanded.val ? 'Hide' : 'Show', onclicked: () => expanded.val = !expanded.val }),
              Revealer({
                revealChild: expanded,
              },
                Label({ label: "Hello,world" })
              )
            ))
          )
        )
      )
    })
    return win;
  })
  .exitOnClose()
  .run()
